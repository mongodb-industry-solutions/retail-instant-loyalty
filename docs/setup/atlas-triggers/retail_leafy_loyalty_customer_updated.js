/******************************************************************************
 *  CUSTOMER SESSION LOYALTY CONFIGURATION TRIGGER                            *
 *  ========================================================================  *
 *  PURPOSE                                                                   *
 *  -------                                                                   *
 *  This database trigger reacts to customer document updates and replacements*
 *  to create or clean up session-specific loyalty data. It runs when         *
 *  `sessionId` or `preferences.isActive` changes.                             *
 *                                                                            *
 *  - When a customer is active and has a `sessionId`, a loyalty              *
 *    configuration document is created for that session.                    *
 *  - When a customer becomes inactive, the session's loyalty                 *
 *    configuration, orders, transactions, and loyalty history are removed.  *
 *  - Loyalty fields on the customer are reset by the POST `/session/end` API,*
 *    not by this trigger.                                                    *
 *                                                                            *
 *  TRIGGER CONFIGURATION                                                     *
 *  --------------------                                                      *
 *  Type: Database trigger (not scheduled)                                    *
 *  Watches: `retail_leafy_loyalty.customers`                                  *
 *  Operations: Update Document and Replace Document                          *
 *  Required: Full Document and Document Pre-Image enabled                    *
 ******************************************************************************/
exports = async function(changeEvent) {

  const serviceName = "<your-cluster-name>";
  const database = "<db-name>";
  const customer = changeEvent.fullDocument;
  const before = changeEvent.fullDocumentBeforeChange;

  if (changeEvent.operationType !== "update" && changeEvent.operationType !== "replace") return;

  if (!before) {
    console.log("No pre-image available - enable Document Preimage on this trigger.");
    return;
  }

  // Only proceed if sessionId or preferences.isActive actually changed in this write.
  const sessionIdChanged = before.sessionId !== customer.sessionId;
  const isActiveChanged = before.preferences?.isActive !== customer.preferences?.isActive;

  if (!sessionIdChanged && !isActiveChanged) {
    console.log("Neither sessionId nor preferences.isActive changed - skipping.");
    return;
  }

  const isActive = customer.preferences.isActive;
  const sessionId = customer.sessionId;
  const sessionStartedAt = customer.sessionStartedAt ? customer.sessionStartedAt : new Date();

  const loyaltyCollection = context.services.get(serviceName).db(database).collection('loyaltyConfiguration');
  const seedLoyaltyCollection = context.services.get(serviceName).db(database).collection('seedLoyaltyConfiguration');

  try {
    if (isActive === true && sessionId) {
      console.log("Inserting loyalty config for active session");
      const seedDoc = await seedLoyaltyCollection.findOne({});
      const loyaltyConfigData = { ...seedDoc.seedFields, sessionId, sessionStartedAt };
      console.log(JSON.stringify(loyaltyConfigData));
      await loyaltyCollection.insertOne(loyaltyConfigData);
    } else if (isActive === false) {
      console.log("Removing data for end session of customer");
      const previousSessionId = before.sessionId;
      await loyaltyCollection.deleteOne({ sessionId: previousSessionId });
      // Reset all loyalty fields happens in the POST /session/end API
      const ordersCollection = context.services.get(serviceName).db(database).collection('orders');
      const transactionsCollection = context.services.get(serviceName).db(database).collection('transactions');
      const loyaltyHistoryCollection = context.services.get(serviceName).db(database).collection('loyaltyHistory');
      await ordersCollection.deleteMany({ sessionId: previousSessionId });
      await transactionsCollection.deleteMany({ sessionId: previousSessionId });
      await loyaltyHistoryCollection.deleteMany({ sessionId: previousSessionId });
    }
  } catch (err) {
    console.log("error performing mongodb write:", err.message);
  }
};