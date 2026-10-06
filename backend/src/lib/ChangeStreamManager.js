class ChangeStreamManager {
  constructor(db) {
    this.db = db;
    this.customerSubscriber = new Map();
    this.orderSubscriber = new Map();
    this.customerChangeStream = null;
    this.orderChangeStream = null;
  }
}
