---
trigger: always_on
---

This project uses PocketBase as backend with an Expo (React Native) frontend.

CFS is a service defined in the `services` collection.
CFS service types are defined in the `sub_services` collection.

All CFS services must be created using the `cfs_service_requests` collection.

Do not create new collections for CFS services.
Do not duplicate service-specific collections.

All PocketBase create/update/list operations must be implemented
inside `lib/actions/**` files only.

UI components and screens must never directly access PocketBase.

All CFS service requests must start with status = "Pending".

Do not hardcode service IDs or serviceType IDs.
Always fetch them dynamically from PocketBase.

Mobile app is customer-facing only.
Do not implement admin or approval logic in mobile UI.

Allowed statuses:
Pending, Accepted, Rejected, In Progress, Completed.

Do not change or invent schema fields.
Use relations exactly as defined in PocketBase schema.

Use existing project folder structure and patterns.

All API calls must go through the `lib/actions` layer.
Never bypass the action layer to access PocketBase directly.

Always use the provided action functions for all PocketBase operations.
Do not import pocketbase clients or make direct API calls in UI components.

Ensure all data validation and error handling is done within the action layer.
All CFS-related business logic must be contained within the action layer.
No business logic should be present in UI components or navigation.
All UI components should only handle presentation and user interaction

Never generate or modify TypeScript enums for PocketBase collection names.
Always use const objects for runtime collection identifiers.
