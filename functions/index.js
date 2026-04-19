const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * Auto-expire blood requests after 48 hours.
 * Runs every hour.
 */
exports.expireRequests = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredRequests = await db.collection('requests')
        .where('status', '==', 'Pending')
        .where('expiresAt', '<=', now)
        .get();

    const batch = db.batch();
    expiredRequests.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'Expired' });
    });

    await batch.commit();
    console.log(`Expired ${expiredRequests.size} requests.`);
});

/**
 * Notify donors when a new request matches their blood group and location.
 */
exports.notifyDonorsOnRequest = functions.firestore
    .document('requests/{requestId}')
    .onCreate(async (snapshot, context) => {
        const requestData = snapshot.data();
        const { bloodGroup, district, urgency } = requestData;

        // Find matching donors in the same district
        const donors = await db.collection('users')
            .where('bloodGroup', '==', bloodGroup)
            .where('district', '==', district)
            .where('isAvailable', '==', true)
            .get();

        const tokens = [];
        donors.docs.forEach(doc => {
            const donor = doc.data();
            if (donor.fcmToken) tokens.push(donor.fcmToken);
        });

        if (tokens.length > 0) {
            const message = {
                notification: {
                    title: `Urgent: ${bloodGroup} needed!`,
                    body: `A ${urgency} request has been created in ${district}. Can you help?`,
                },
                tokens: tokens,
            };
            await admin.messaging().sendMulticast(message);
        }
    });

/**
 * Remind donors after 90 days of their last donation.
 */
exports.donationReminder = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const eligibleDonors = await db.collection('users')
        .where('lastDonationDate', '<=', admin.firestore.Timestamp.fromDate(ninetyDaysAgo))
        .where('reminded', '==', false)
        .get();

    // Logic to send notification and set reminded = true
});
