# Admin Inquiry API

The admin layer exposes backend operations for the account-manager dashboard:

- list inquiries
- retrieve one inquiry
- assign an account manager
- mark an inquiry as contacted

The persistent store is shared with the production inquiry pipeline.

The current demo does not implement authentication or authorization. Before production deployment, protect these operations behind authenticated admin access.
