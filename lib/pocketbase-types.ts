/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	3plJobOrder = "3pl_job_order",
	3plOrderMovement = "3pl_order_movement",
	3plOrders = "3pl_orders",
	3plPricingRequest = "3pl_pricing_request",
	3plServiceDetails = "3pl_service_details",
	3plServiceRequests = "3pl_service_requests",
	3plTariffsRequest = "3pl_tariffs_request",
	3plTransportMovement = "3pl_transport_movement",
	ShippingLine = "Shipping_line",
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	AllowedServiceProviders = "allowed_service_providers",
	AuditLogs = "audit_logs",
	CfsJobOrder = "cfs_job_order",
	CfsOrderMovement = "cfs_order_movement",
	CfsOrders = "cfs_orders",
	CfsPricingRequest = "cfs_pricing_request",
	CfsServiceDetails = "cfs_service_details",
	CfsServiceRequests = "cfs_service_requests",
	ChatSession = "chat_session",
	Containers = "containers",
	CustomCfsJobOrder = "custom_cfs_job_order",
	CustomCfsOrderMovement = "custom_cfs_order_movement",
	CustomCfsOrders = "custom_cfs_orders",
	CustomCfsServiceDetails = "custom_cfs_service_details",
	CustomCfsServiceRequests = "custom_cfs_service_requests",
	CustomOrderPackages = "custom_order_packages",
	CustomPackages = "custom_packages",
	CustomPricingRequest = "custom_pricing_request",
	CustomTransportJobOrder = "custom_transport_job_order",
	CustomTransportOrderMovement = "custom_transport_order_movement",
	CustomTransportOrders = "custom_transport_orders",
	CustomTransportServiceRequests = "custom_transport_service_requests",
	CustomWarehouseJobOrder = "custom_warehouse_job_order",
	CustomWarehouseOrderMovement = "custom_warehouse_order_movement",
	CustomWarehouseOrders = "custom_warehouse_orders",
	CustomWarehouseServiceDetails = "custom_warehouse_service_details",
	CustomWarehouseServiceRequests = "custom_warehouse_service_requests",
	Faqs = "faqs",
	Messages = "messages",
	Notification = "notification",
	Presence = "presence",
	ServiceProvider = "service_provider",
	Services = "services",
	SubServices = "sub_services",
	Ticket = "ticket",
	TransportJobOrder = "transport_job_order",
	TransportOrderMovement = "transport_order_movement",
	TransportOrders = "transport_orders",
	TransportPricingRequest = "transport_pricing_request",
	TransportServiceRequests = "transport_service_requests",
	UserProfile = "user_profile",
	Users = "users",
	Vehicles = "vehicles",
	WarehouseJobOrder = "warehouse_job_order",
	WarehouseOrderMovement = "warehouse_order_movement",
	WarehouseOrders = "warehouse_orders",
	WarehousePricingRequest = "warehouse_pricing_request",
	WarehouseServiceDetails = "warehouse_service_details",
	WarehouseServiceRequests = "warehouse_service_requests",
	WarehouseTariffsRequest = "warehouse_tariffs_request",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

export type GeoPoint = {
	lon: number
	lat: number
}

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export enum 3plJobOrderStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type 3plJobOrderRecord = {
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	id: string
	order?: RecordIdString
	remarks?: string
	service?: RecordIdString
	serviceType?: RecordIdString
	status?: 3plJobOrderStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export type 3plOrderMovementRecord = {
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	order?: RecordIdString
	remarks?: string
	service?: RecordIdString
	status?: string
	updated: IsoAutoDateString
}

export enum 3plOrdersStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type 3plOrdersRecord = {
	blNo?: string
	chaName?: string
	consigneeName?: string
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	customer?: RecordIdString
	endDate?: IsoDateString
	endLocation?: string
	files?: FileNameString[]
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	igmNo?: string
	itemNo?: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	orderDescription?: string
	provider?: RecordIdString
	reason?: string
	serviceRequest?: string
	startDate?: IsoDateString
	startLocation?: string
	status?: 3plOrdersStatusOptions
	updated: IsoAutoDateString
	vehicleDescription?: string
}

export enum 3plPricingRequestContainerTypeOptions {
	"General" = "General",
	"ODC/FR/OT" = "ODC/FR/OT",
	"Refer" = "Refer",
	"Mix" = "Mix",
}

export enum 3plPricingRequestDelayTypeOptions {
	"DPD" = "DPD",
	"Non-DPD" = "Non-DPD",
}

export enum 3plPricingRequestStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type 3plPricingRequestRecord = {
	containerType?: 3plPricingRequestContainerTypeOptions
	containersPerMonth?: number
	created: IsoAutoDateString
	delayType?: 3plPricingRequestDelayTypeOptions
	endLocation?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	preferableRate?: number
	reason?: string
	serviceProvider?: RecordIdString
	specialRequest?: string
	startDate?: IsoDateString
	startLocation?: string
	status?: 3plPricingRequestStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum 3plServiceDetailsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type 3plServiceDetailsRecord = {
	agent?: string
	container?: RecordIdString
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	receiptNo?: string
	remarks?: string
	service?: RecordIdString
	status?: 3plServiceDetailsStatusOptions
	type?: RecordIdString
	updated: IsoAutoDateString
}

export enum 3plServiceRequestsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type 3plServiceRequestsRecord = {
	created: IsoAutoDateString
	customerRemarks?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	service?: RecordIdString
	serviceType?: RecordIdString
	status?: 3plServiceRequestsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum 3plTariffsRequestTypeOptions {
	"Loaded" = "Loaded",
	"Destuff" = "Destuff",
}

export enum 3plTariffsRequestStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type 3plTariffsRequestRecord = {
	container?: RecordIdString
	created: IsoAutoDateString
	files?: FileNameString[]
	fromDate?: IsoDateString
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	remarks?: string
	service?: RecordIdString
	status?: 3plTariffsRequestStatusOptions
	toDate?: IsoDateString
	type?: 3plTariffsRequestTypeOptions
	updated: IsoAutoDateString
}

export enum 3plTransportMovementStatusOptions {
	"Not Started" = "Not Started",
	"In Transit" = "In Transit",
	"Delivered" = "Delivered",
	"Cancelled" = "Cancelled",
}
export type 3plTransportMovementRecord<Tdriver = unknown> = {
	created: IsoAutoDateString
	currentLocation?: GeoPoint
	driver?: null | Tdriver
	endDate?: IsoDateString
	endLocation?: GeoPoint
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	remarks?: string
	startDate?: IsoDateString
	startLocation?: GeoPoint
	status?: 3plTransportMovementStatusOptions
	updated: IsoAutoDateString
	vehicle?: RecordIdString
}

export type ShippingLineRecord = {
	Name?: string
	created: IsoAutoDateString
	id: string
	updated: IsoAutoDateString
}

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type AllowedServiceProvidersRecord = {
	created: IsoAutoDateString
	id: string
	provider?: RecordIdString
	service?: RecordIdString[]
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type AuditLogsRecord = {
	action?: string
	created: IsoAutoDateString
	details?: string
	id: string
	module?: string
	subModule?: string
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum CfsJobOrderStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CfsJobOrderRecord = {
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	id: string
	order?: RecordIdString
	remarks?: string
	serviceType?: RecordIdString
	status?: CfsJobOrderStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export type CfsOrderMovementRecord = {
	CFSIN?: boolean
	CFSOUT?: boolean
	cfs_in_time?: IsoDateString
	cfs_out_time?: IsoDateString
	created: IsoAutoDateString
	date_of_delivery?: IsoDateString
	files?: FileNameString[]
	id: string
	order?: RecordIdString
	remarks?: string
	updated: IsoAutoDateString
}

export enum CfsOrdersStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}

export enum CfsOrdersDeliveryTypeOptions {
	"Loaded" = "Loaded",
	"Destuffed" = "Destuffed",
}
export type CfsOrdersRecord = {
	blNo?: string
	cfs?: RecordIdString
	chaName?: string
	confirmShippingLine?: FileNameString[]
	consigneeName?: string
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	customer?: RecordIdString
	deliveryType?: CfsOrdersDeliveryTypeOptions
	eta?: IsoDateString
	files?: FileNameString[]
	fromDate?: IsoDateString
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	igmNo?: string
	itemNo?: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	orderDescription?: string
	reason?: string
	shipping_line?: string
	status?: CfsOrdersStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export enum CfsPricingRequestContainerTypeOptions {
	"General" = "General",
	"ODC/FR/OT" = "ODC/FR/OT",
	"Refer" = "Refer",
	"Mix" = "Mix",
}

export enum CfsPricingRequestDelayTypeOptions {
	"DPD" = "DPD",
	"Non-DPD" = "Non-DPD",
}

export enum CfsPricingRequestStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CfsPricingRequestRecord<Textra_info = unknown> = {
	containerType?: CfsPricingRequestContainerTypeOptions
	containersPerMonth?: number
	created: IsoAutoDateString
	delayType?: CfsPricingRequestDelayTypeOptions
	extra_info?: null | Textra_info
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	preferableRate?: number
	reason?: string
	serviceProvider?: RecordIdString
	status?: CfsPricingRequestStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum CfsServiceDetailsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CfsServiceDetailsRecord = {
	agent?: string
	container?: RecordIdString
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	receiptNo?: string
	remarks?: string
	status?: CfsServiceDetailsStatusOptions
	type?: RecordIdString
	updated: IsoAutoDateString
}

export enum CfsServiceRequestsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CfsServiceRequestsRecord<TExtra_info = unknown> = {
	Extra_info?: null | TExtra_info
	created: IsoAutoDateString
	customerRemarks?: string
	files?: FileNameString[]
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	serviceType?: RecordIdString
	status?: CfsServiceRequestsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum ChatSessionStatusOptions {
	"Open" = "Open",
	"Close" = "Close",
}

export enum ChatSessionChatTypeOptions {
	"support" = "support",
	"client_customer" = "client_customer",
}

export enum ChatSessionServiceTypeOptions {
	"CFS" = "CFS",
	"Transport" = "Transport",
	"3PL" = "3PL",
	"Warehouse" = "Warehouse",
}
export type ChatSessionRecord = {
	agent?: RecordIdString
	chatType?: ChatSessionChatTypeOptions
	client?: RecordIdString
	closed_at?: IsoDateString
	created: IsoAutoDateString
	customer?: RecordIdString
	id: string
	lastMessageAt?: IsoDateString
	relatedOrderid?: RecordIdString
	serviceType?: ChatSessionServiceTypeOptions
	status?: ChatSessionStatusOptions
	subject?: string
	ticket?: RecordIdString
	typingUserId?: RecordIdString[]
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum ContainersStatusOptions {
	"Good" = "Good",
	"Empty" = "Empty",
	"Loading" = "Loading",
	"Loaded" = "Loaded",
	"Damaged" = "Damaged",
	"Missing" = "Missing",
	"Broken" = "Broken",
	"COR" = "COR",
	"Free" = "Free",
	"Busy" = "Busy",
}
export type ContainersRecord = {
	cargoType?: string
	containerNo?: string
	created: IsoAutoDateString
	id: string
	ownedBy?: RecordIdString
	size?: string
	status?: ContainersStatusOptions
	updated: IsoAutoDateString
}

export enum CustomCfsJobOrderStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomCfsJobOrderRecord = {
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	id: string
	order?: RecordIdString
	remarks?: string
	serviceType?: RecordIdString
	status?: CustomCfsJobOrderStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export type CustomCfsOrderMovementRecord = {
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	order?: RecordIdString
	remarks?: string
	status?: string
	updated: IsoAutoDateString
}

export enum CustomCfsOrdersStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomCfsOrdersRecord = {
	blNo?: string
	cfs?: RecordIdString
	chaName?: string
	consigneeName?: string
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	customer?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	igmNo?: string
	itemNo?: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	orderDescription?: string
	reason?: string
	status?: CustomCfsOrdersStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export enum CustomCfsServiceDetailsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomCfsServiceDetailsRecord = {
	agent?: string
	container?: RecordIdString
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	receiptNo?: string
	remarks?: string
	status?: CustomCfsServiceDetailsStatusOptions
	type?: RecordIdString
	updated: IsoAutoDateString
}

export enum CustomCfsServiceRequestsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomCfsServiceRequestsRecord = {
	created: IsoAutoDateString
	customerRemarks?: string
	files?: FileNameString[]
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	serviceType?: RecordIdString
	status?: CustomCfsServiceRequestsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type CustomOrderPackagesRecord = {
	cfs?: RecordIdString
	created: IsoAutoDateString
	createdBy?: RecordIdString
	description?: string
	id: string
	title?: string
	transport?: RecordIdString
	updated: IsoAutoDateString
	warehouse?: RecordIdString
}

export type CustomPackagesRecord = {
	created: IsoAutoDateString
	description?: string
	id: string
	services?: RecordIdString[]
	title?: string
	updated: IsoAutoDateString
}

export enum CustomPricingRequestContainerTypeOptions {
	"General" = "General",
	"ODC/FR/OT" = "ODC/FR/OT",
	"Refer" = "Refer",
	"Mix" = "Mix",
}

export enum CustomPricingRequestDelayTypeOptions {
	"DPD" = "DPD",
	"Non-DPD" = "Non-DPD",
}

export enum CustomPricingRequestStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomPricingRequestRecord = {
	containerType?: CustomPricingRequestContainerTypeOptions
	containersPerMonth?: number
	created: IsoAutoDateString
	delayType?: CustomPricingRequestDelayTypeOptions
	endLocation?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	package?: RecordIdString
	preferableRate?: number
	reason?: string
	specialRequest?: string
	startDate?: IsoDateString
	startLocation?: string
	status?: CustomPricingRequestStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum CustomTransportJobOrderStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomTransportJobOrderRecord = {
	created: IsoAutoDateString
	createdBy?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	id: string
	order?: RecordIdString
	remarks?: string
	serviceType?: RecordIdString
	status?: CustomTransportJobOrderStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
	vehicles?: RecordIdString[]
}

export enum CustomTransportOrderMovementStatusOptions {
	"Not Started" = "Not Started",
	"In Transit" = "In Transit",
	"Delivered" = "Delivered",
	"Cancelled" = "Cancelled",
}
export type CustomTransportOrderMovementRecord<Tdriver = unknown> = {
	created: IsoAutoDateString
	currentLocation?: GeoPoint
	driver?: null | Tdriver
	endDate?: IsoDateString
	endLocation?: GeoPoint
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	remarks?: string
	startDate?: IsoDateString
	startLocation?: GeoPoint
	status?: CustomTransportOrderMovementStatusOptions
	updated: IsoAutoDateString
	vehicle?: RecordIdString
}

export enum CustomTransportOrdersStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"In Transit" = "In Transit",
	"Delivered" = "Delivered",
}
export type CustomTransportOrdersRecord = {
	chaName?: string
	consigneeName?: string
	created: IsoAutoDateString
	createdBy?: RecordIdString
	customer?: RecordIdString
	endDate?: IsoDateString
	endLocation?: string
	files?: FileNameString[]
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	orderDescription?: string
	provider?: RecordIdString
	reason?: string
	specialRequest?: string
	startDate?: IsoDateString
	startLocation?: string
	status?: CustomTransportOrdersStatusOptions
	updated: IsoAutoDateString
	vehicleDescription?: string
}

export enum CustomTransportServiceRequestsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomTransportServiceRequestsRecord = {
	created: IsoAutoDateString
	customerRemarks?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	serviceType?: RecordIdString
	status?: CustomTransportServiceRequestsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum CustomWarehouseJobOrderStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomWarehouseJobOrderRecord = {
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	id: string
	order?: RecordIdString
	remarks?: string
	serviceType?: RecordIdString
	status?: CustomWarehouseJobOrderStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export type CustomWarehouseOrderMovementRecord = {
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	order?: RecordIdString
	remarks?: string
	status?: string
	updated: IsoAutoDateString
}

export enum CustomWarehouseOrdersStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomWarehouseOrdersRecord = {
	blNo?: string
	chaName?: string
	consigneeName?: string
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	customer?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	igmNo?: string
	itemNo?: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	orderDescription?: string
	provider?: RecordIdString
	reason?: string
	status?: CustomWarehouseOrdersStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export enum CustomWarehouseServiceDetailsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomWarehouseServiceDetailsRecord = {
	agent?: string
	container?: RecordIdString
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	receiptNo?: string
	remarks?: string
	status?: CustomWarehouseServiceDetailsStatusOptions
	type?: RecordIdString
	updated: IsoAutoDateString
}

export enum CustomWarehouseServiceRequestsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type CustomWarehouseServiceRequestsRecord = {
	created: IsoAutoDateString
	customerRemarks?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	serviceType?: RecordIdString
	status?: CustomWarehouseServiceRequestsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type FaqsRecord<Ttags = unknown> = {
	answer?: HTMLString
	created: IsoAutoDateString
	id: string
	question?: string
	tags?: null | Ttags
	updated: IsoAutoDateString
}

export enum MessagesMessageTypeOptions {
	"text" = "text",
	"file" = "file",
}
export type MessagesRecord = {
	attachments?: FileNameString
	chat?: RecordIdString
	content?: string
	created: IsoAutoDateString
	id: string
	isRead?: boolean
	messageType?: MessagesMessageTypeOptions
	readAt?: IsoDateString
	sender?: RecordIdString
	updated: IsoAutoDateString
}

export enum NotificationTypeOptions {
	"event" = "event",
	"alert" = "alert",
}

export enum NotificationModeOptions {
	"zoom" = "zoom",
}

export enum NotificationStatusOptions {
	"Active" = "Active",
	"Inactive" = "Inactive",
}

export enum NotificationCreatedForOptions {
	"Customer" = "Customer",
	"Merchant" = "Merchant",
	"Gol" = "Gol",
}
export type NotificationRecord = {
	attachment?: FileNameString[]
	created: IsoAutoDateString
	createdFor?: NotificationCreatedForOptions
	date?: IsoDateString
	description?: string
	end_time?: IsoDateString
	id: string
	isRead?: boolean
	link1?: string
	link2?: string
	link3?: string
	mode?: NotificationModeOptions
	orders_id?: string
	sentOn?: IsoDateString
	start_time?: IsoDateString
	status?: NotificationStatusOptions
	time?: IsoDateString
	title?: string
	type?: NotificationTypeOptions
	updated: IsoAutoDateString
}

export enum PresenceStatusOptions {
	"online" = "online",
	"offline" = "offline",
	"away" = "away",
	"busy" = "busy",
}
export type PresenceRecord = {
	created: IsoAutoDateString
	id: string
	lastSeen?: IsoDateString
	status?: PresenceStatusOptions
	statusMessage?: string
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type ServiceProviderRecord<TTypesOfVehicles = unknown, Tfeatures = unknown, Ttags = unknown> = {
	DocumentationCharges?: number
	InsuranceCharges?: number
	NoOfVehicles?: number
	TypesOfVehicles?: null | TTypesOfVehicles
	author?: RecordIdString
	bonded?: boolean
	contact?: string
	created: IsoAutoDateString
	description?: string
	features?: null | Tfeatures
	files?: FileNameString[]
	freeDays?: number
	general?: boolean
	id: string
	location?: string
	monthlyDues?: number
	rating?: number
	service?: RecordIdString[]
	tags?: null | Ttags
	tariffRates?: number
	title?: string
	updated: IsoAutoDateString
	verificationDocs?: FileNameString[]
	verified?: boolean
}

export type ServicesRecord = {
	created: IsoAutoDateString
	description?: string
	id: string
	title?: string
	updated: IsoAutoDateString
}

export type SubServicesRecord = {
	created: IsoAutoDateString
	description?: string
	id: string
	service?: RecordIdString
	title?: string
	updated: IsoAutoDateString
}

export enum TicketStatusOptions {
	"Open" = "Open",
	"In_Progress" = "In_Progress",
	"Resolved" = "Resolved",
	"Closed" = "Closed",
}

export enum TicketPriorityOptions {
	"Low" = "Low",
	"Medium" = "Medium",
	"High" = "High",
	"Urgent" = "Urgent",
}
export type TicketRecord = {
	accepted?: boolean
	assigned_to?: RecordIdString
	created: IsoAutoDateString
	customer?: RecordIdString
	description?: HTMLString
	id: string
	priority?: TicketPriorityOptions
	relatedOrderid?: RecordIdString
	status?: TicketStatusOptions
	subject?: string
	updated: IsoAutoDateString
}

export enum TransportJobOrderStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type TransportJobOrderRecord = {
	created: IsoAutoDateString
	createdBy?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	id: string
	order?: RecordIdString
	remarks?: string
	serviceType?: RecordIdString
	status?: TransportJobOrderStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
	vehicles?: RecordIdString[]
}

export enum TransportOrderMovementStatusOptions {
	"Not Started" = "Not Started",
	"In Transit" = "In Transit",
	"Delivered" = "Delivered",
	"Cancelled" = "Cancelled",
}
export type TransportOrderMovementRecord<Tdriver = unknown> = {
	created: IsoAutoDateString
	currentLocation?: GeoPoint
	driver?: null | Tdriver
	endDate?: IsoDateString
	endLocation?: GeoPoint
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	remarks?: string
	startDate?: IsoDateString
	startLocation?: GeoPoint
	status?: TransportOrderMovementStatusOptions
	updated: IsoAutoDateString
	vehicle?: RecordIdString
}

export enum TransportOrdersStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"In Transit" = "In Transit",
	"Delivered" = "Delivered",
}
export type TransportOrdersRecord = {
	chaName?: string
	consigneeName?: string
	created: IsoAutoDateString
	createdBy?: RecordIdString
	customer?: RecordIdString
	endDate?: IsoDateString
	endLocation?: string
	files?: FileNameString[]
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	orderDescription?: string
	provider?: RecordIdString
	reason?: string
	specialRequest?: string
	startDate?: IsoDateString
	startLocation?: string
	status?: TransportOrdersStatusOptions
	updated: IsoAutoDateString
	vehicleDescription?: string
}

export enum TransportPricingRequestStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type TransportPricingRequestRecord = {
	containersPerMonth?: number
	created: IsoAutoDateString
	endLocation?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	preferableRate?: number
	reason?: string
	serviceProvider?: RecordIdString
	specialRequest?: string
	startDate?: IsoDateString
	startLocation?: string
	status?: TransportPricingRequestStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum TransportServiceRequestsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type TransportServiceRequestsRecord = {
	created: IsoAutoDateString
	customerRemarks?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	serviceType?: RecordIdString
	status?: TransportServiceRequestsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type UserProfileRecord = {
	address?: string
	businessName?: string
	contact?: string
	created: IsoAutoDateString
	documents?: FileNameString[]
	gstIn?: string
	id: string
	panNo?: string
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum UsersRoleOptions {
	"Root" = "Root",
	"GOLMod" = "GOLMod",
	"GOLStaff" = "GOLStaff",
	"Merchant" = "Merchant",
	"Customer" = "Customer",
}

export enum UsersStatusOptions {
	"Active" = "Active",
	"Blocklist" = "Blocklist",
	"Pending" = "Pending",
}
export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	firstname?: string
	id: string
	isVerified?: boolean
	lastname?: string
	name?: string
	password: string
	phone?: number
	role?: UsersRoleOptions
	status?: UsersStatusOptions
	tokenKey: string
	updated: IsoAutoDateString
	username?: string
	verified?: boolean
}

export enum VehiclesStatusOptions {
	"Open" = "Open",
	"Busy" = "Busy",
	"Damaged" = "Damaged",
}
export type VehiclesRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	ownedBy?: RecordIdString
	status?: VehiclesStatusOptions
	updated: IsoAutoDateString
	vehicleNo?: string
}

export enum WarehouseJobOrderStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type WarehouseJobOrderRecord = {
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	id: string
	order?: RecordIdString
	remarks?: string
	serviceType?: RecordIdString
	status?: WarehouseJobOrderStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export type WarehouseOrderMovementRecord = {
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	order?: RecordIdString
	remarks?: string
	status?: string
	updated: IsoAutoDateString
}

export enum WarehouseOrdersStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type WarehouseOrdersRecord = {
	blNo?: string
	chaName?: string
	consigneeName?: string
	containers?: RecordIdString[]
	created: IsoAutoDateString
	createdBy?: RecordIdString
	customer?: RecordIdString
	files?: FileNameString[]
	fromDate?: IsoDateString
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	igmNo?: string
	itemNo?: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	orderDescription?: string
	provider?: RecordIdString
	reason?: string
	status?: WarehouseOrdersStatusOptions
	toDate?: IsoDateString
	updated: IsoAutoDateString
}

export enum WarehousePricingRequestContainerTypeOptions {
	"General" = "General",
	"ODC/FR/OT" = "ODC/FR/OT",
	"Refer" = "Refer",
	"Mix" = "Mix",
}

export enum WarehousePricingRequestDelayTypeOptions {
	"DPD" = "DPD",
	"Non-DPD" = "Non-DPD",
}

export enum WarehousePricingRequestStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type WarehousePricingRequestRecord = {
	containerType?: WarehousePricingRequestContainerTypeOptions
	containersPerMonth?: number
	created: IsoAutoDateString
	delayType?: WarehousePricingRequestDelayTypeOptions
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	preferableRate?: number
	reason?: string
	serviceProvider?: RecordIdString
	status?: WarehousePricingRequestStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum WarehouseServiceDetailsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type WarehouseServiceDetailsRecord = {
	agent?: string
	container?: RecordIdString
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	jobOrder?: RecordIdString
	order?: RecordIdString
	receiptNo?: string
	remarks?: string
	status?: WarehouseServiceDetailsStatusOptions
	type?: RecordIdString
	updated: IsoAutoDateString
}

export enum WarehouseServiceRequestsStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type WarehouseServiceRequestsRecord = {
	created: IsoAutoDateString
	customerRemarks?: string
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	serviceType?: RecordIdString
	status?: WarehouseServiceRequestsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum WarehouseTariffsRequestTypeOptions {
	"Loaded" = "Loaded",
	"Destuff" = "Destuff",
}

export enum WarehouseTariffsRequestStatusOptions {
	"Pending" = "Pending",
	"Accepted" = "Accepted",
	"Rejected" = "Rejected",
	"In Progress" = "In Progress",
	"Completed" = "Completed",
}
export type WarehouseTariffsRequestRecord = {
	container?: RecordIdString
	created: IsoAutoDateString
	files?: FileNameString[]
	fromDate?: IsoDateString
	golVerified?: boolean
	golVerifiedBy?: RecordIdString
	id: string
	merchantVerified?: boolean
	merchantVerifiedBy?: RecordIdString
	order?: RecordIdString
	reason?: string
	remarks?: string
	status?: WarehouseTariffsRequestStatusOptions
	toDate?: IsoDateString
	type?: WarehouseTariffsRequestTypeOptions
	updated: IsoAutoDateString
}

// Response types include system fields and match responses from the PocketBase API
export type 3plJobOrderResponse<Texpand = unknown> = Required<3plJobOrderRecord> & BaseSystemFields<Texpand>
export type 3plOrderMovementResponse<Texpand = unknown> = Required<3plOrderMovementRecord> & BaseSystemFields<Texpand>
export type 3plOrdersResponse<Texpand = unknown> = Required<3plOrdersRecord> & BaseSystemFields<Texpand>
export type 3plPricingRequestResponse<Texpand = unknown> = Required<3plPricingRequestRecord> & BaseSystemFields<Texpand>
export type 3plServiceDetailsResponse<Texpand = unknown> = Required<3plServiceDetailsRecord> & BaseSystemFields<Texpand>
export type 3plServiceRequestsResponse<Texpand = unknown> = Required<3plServiceRequestsRecord> & BaseSystemFields<Texpand>
export type 3plTariffsRequestResponse<Texpand = unknown> = Required<3plTariffsRequestRecord> & BaseSystemFields<Texpand>
export type 3plTransportMovementResponse<Tdriver = unknown, Texpand = unknown> = Required<3plTransportMovementRecord<Tdriver>> & BaseSystemFields<Texpand>
export type ShippingLineResponse<Texpand = unknown> = Required<ShippingLineRecord> & BaseSystemFields<Texpand>
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AllowedServiceProvidersResponse<Texpand = unknown> = Required<AllowedServiceProvidersRecord> & BaseSystemFields<Texpand>
export type AuditLogsResponse<Texpand = unknown> = Required<AuditLogsRecord> & BaseSystemFields<Texpand>
export type CfsJobOrderResponse<Texpand = unknown> = Required<CfsJobOrderRecord> & BaseSystemFields<Texpand>
export type CfsOrderMovementResponse<Texpand = unknown> = Required<CfsOrderMovementRecord> & BaseSystemFields<Texpand>
export type CfsOrdersResponse<Texpand = unknown> = Required<CfsOrdersRecord> & BaseSystemFields<Texpand>
export type CfsPricingRequestResponse<Textra_info = unknown, Texpand = unknown> = Required<CfsPricingRequestRecord<Textra_info>> & BaseSystemFields<Texpand>
export type CfsServiceDetailsResponse<Texpand = unknown> = Required<CfsServiceDetailsRecord> & BaseSystemFields<Texpand>
export type CfsServiceRequestsResponse<TExtra_info = unknown, Texpand = unknown> = Required<CfsServiceRequestsRecord<TExtra_info>> & BaseSystemFields<Texpand>
export type ChatSessionResponse<Texpand = unknown> = Required<ChatSessionRecord> & BaseSystemFields<Texpand>
export type ContainersResponse<Texpand = unknown> = Required<ContainersRecord> & BaseSystemFields<Texpand>
export type CustomCfsJobOrderResponse<Texpand = unknown> = Required<CustomCfsJobOrderRecord> & BaseSystemFields<Texpand>
export type CustomCfsOrderMovementResponse<Texpand = unknown> = Required<CustomCfsOrderMovementRecord> & BaseSystemFields<Texpand>
export type CustomCfsOrdersResponse<Texpand = unknown> = Required<CustomCfsOrdersRecord> & BaseSystemFields<Texpand>
export type CustomCfsServiceDetailsResponse<Texpand = unknown> = Required<CustomCfsServiceDetailsRecord> & BaseSystemFields<Texpand>
export type CustomCfsServiceRequestsResponse<Texpand = unknown> = Required<CustomCfsServiceRequestsRecord> & BaseSystemFields<Texpand>
export type CustomOrderPackagesResponse<Texpand = unknown> = Required<CustomOrderPackagesRecord> & BaseSystemFields<Texpand>
export type CustomPackagesResponse<Texpand = unknown> = Required<CustomPackagesRecord> & BaseSystemFields<Texpand>
export type CustomPricingRequestResponse<Texpand = unknown> = Required<CustomPricingRequestRecord> & BaseSystemFields<Texpand>
export type CustomTransportJobOrderResponse<Texpand = unknown> = Required<CustomTransportJobOrderRecord> & BaseSystemFields<Texpand>
export type CustomTransportOrderMovementResponse<Tdriver = unknown, Texpand = unknown> = Required<CustomTransportOrderMovementRecord<Tdriver>> & BaseSystemFields<Texpand>
export type CustomTransportOrdersResponse<Texpand = unknown> = Required<CustomTransportOrdersRecord> & BaseSystemFields<Texpand>
export type CustomTransportServiceRequestsResponse<Texpand = unknown> = Required<CustomTransportServiceRequestsRecord> & BaseSystemFields<Texpand>
export type CustomWarehouseJobOrderResponse<Texpand = unknown> = Required<CustomWarehouseJobOrderRecord> & BaseSystemFields<Texpand>
export type CustomWarehouseOrderMovementResponse<Texpand = unknown> = Required<CustomWarehouseOrderMovementRecord> & BaseSystemFields<Texpand>
export type CustomWarehouseOrdersResponse<Texpand = unknown> = Required<CustomWarehouseOrdersRecord> & BaseSystemFields<Texpand>
export type CustomWarehouseServiceDetailsResponse<Texpand = unknown> = Required<CustomWarehouseServiceDetailsRecord> & BaseSystemFields<Texpand>
export type CustomWarehouseServiceRequestsResponse<Texpand = unknown> = Required<CustomWarehouseServiceRequestsRecord> & BaseSystemFields<Texpand>
export type FaqsResponse<Ttags = unknown, Texpand = unknown> = Required<FaqsRecord<Ttags>> & BaseSystemFields<Texpand>
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> & BaseSystemFields<Texpand>
export type NotificationResponse<Texpand = unknown> = Required<NotificationRecord> & BaseSystemFields<Texpand>
export type PresenceResponse<Texpand = unknown> = Required<PresenceRecord> & BaseSystemFields<Texpand>
export type ServiceProviderResponse<TTypesOfVehicles = unknown, Tfeatures = unknown, Ttags = unknown, Texpand = unknown> = Required<ServiceProviderRecord<TTypesOfVehicles, Tfeatures, Ttags>> & BaseSystemFields<Texpand>
export type ServicesResponse<Texpand = unknown> = Required<ServicesRecord> & BaseSystemFields<Texpand>
export type SubServicesResponse<Texpand = unknown> = Required<SubServicesRecord> & BaseSystemFields<Texpand>
export type TicketResponse<Texpand = unknown> = Required<TicketRecord> & BaseSystemFields<Texpand>
export type TransportJobOrderResponse<Texpand = unknown> = Required<TransportJobOrderRecord> & BaseSystemFields<Texpand>
export type TransportOrderMovementResponse<Tdriver = unknown, Texpand = unknown> = Required<TransportOrderMovementRecord<Tdriver>> & BaseSystemFields<Texpand>
export type TransportOrdersResponse<Texpand = unknown> = Required<TransportOrdersRecord> & BaseSystemFields<Texpand>
export type TransportPricingRequestResponse<Texpand = unknown> = Required<TransportPricingRequestRecord> & BaseSystemFields<Texpand>
export type TransportServiceRequestsResponse<Texpand = unknown> = Required<TransportServiceRequestsRecord> & BaseSystemFields<Texpand>
export type UserProfileResponse<Texpand = unknown> = Required<UserProfileRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VehiclesResponse<Texpand = unknown> = Required<VehiclesRecord> & BaseSystemFields<Texpand>
export type WarehouseJobOrderResponse<Texpand = unknown> = Required<WarehouseJobOrderRecord> & BaseSystemFields<Texpand>
export type WarehouseOrderMovementResponse<Texpand = unknown> = Required<WarehouseOrderMovementRecord> & BaseSystemFields<Texpand>
export type WarehouseOrdersResponse<Texpand = unknown> = Required<WarehouseOrdersRecord> & BaseSystemFields<Texpand>
export type WarehousePricingRequestResponse<Texpand = unknown> = Required<WarehousePricingRequestRecord> & BaseSystemFields<Texpand>
export type WarehouseServiceDetailsResponse<Texpand = unknown> = Required<WarehouseServiceDetailsRecord> & BaseSystemFields<Texpand>
export type WarehouseServiceRequestsResponse<Texpand = unknown> = Required<WarehouseServiceRequestsRecord> & BaseSystemFields<Texpand>
export type WarehouseTariffsRequestResponse<Texpand = unknown> = Required<WarehouseTariffsRequestRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	3pl_job_order: 3plJobOrderRecord
	3pl_order_movement: 3plOrderMovementRecord
	3pl_orders: 3plOrdersRecord
	3pl_pricing_request: 3plPricingRequestRecord
	3pl_service_details: 3plServiceDetailsRecord
	3pl_service_requests: 3plServiceRequestsRecord
	3pl_tariffs_request: 3plTariffsRequestRecord
	3pl_transport_movement: 3plTransportMovementRecord
	Shipping_line: ShippingLineRecord
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	allowed_service_providers: AllowedServiceProvidersRecord
	audit_logs: AuditLogsRecord
	cfs_job_order: CfsJobOrderRecord
	cfs_order_movement: CfsOrderMovementRecord
	cfs_orders: CfsOrdersRecord
	cfs_pricing_request: CfsPricingRequestRecord
	cfs_service_details: CfsServiceDetailsRecord
	cfs_service_requests: CfsServiceRequestsRecord
	chat_session: ChatSessionRecord
	containers: ContainersRecord
	custom_cfs_job_order: CustomCfsJobOrderRecord
	custom_cfs_order_movement: CustomCfsOrderMovementRecord
	custom_cfs_orders: CustomCfsOrdersRecord
	custom_cfs_service_details: CustomCfsServiceDetailsRecord
	custom_cfs_service_requests: CustomCfsServiceRequestsRecord
	custom_order_packages: CustomOrderPackagesRecord
	custom_packages: CustomPackagesRecord
	custom_pricing_request: CustomPricingRequestRecord
	custom_transport_job_order: CustomTransportJobOrderRecord
	custom_transport_order_movement: CustomTransportOrderMovementRecord
	custom_transport_orders: CustomTransportOrdersRecord
	custom_transport_service_requests: CustomTransportServiceRequestsRecord
	custom_warehouse_job_order: CustomWarehouseJobOrderRecord
	custom_warehouse_order_movement: CustomWarehouseOrderMovementRecord
	custom_warehouse_orders: CustomWarehouseOrdersRecord
	custom_warehouse_service_details: CustomWarehouseServiceDetailsRecord
	custom_warehouse_service_requests: CustomWarehouseServiceRequestsRecord
	faqs: FaqsRecord
	messages: MessagesRecord
	notification: NotificationRecord
	presence: PresenceRecord
	service_provider: ServiceProviderRecord
	services: ServicesRecord
	sub_services: SubServicesRecord
	ticket: TicketRecord
	transport_job_order: TransportJobOrderRecord
	transport_order_movement: TransportOrderMovementRecord
	transport_orders: TransportOrdersRecord
	transport_pricing_request: TransportPricingRequestRecord
	transport_service_requests: TransportServiceRequestsRecord
	user_profile: UserProfileRecord
	users: UsersRecord
	vehicles: VehiclesRecord
	warehouse_job_order: WarehouseJobOrderRecord
	warehouse_order_movement: WarehouseOrderMovementRecord
	warehouse_orders: WarehouseOrdersRecord
	warehouse_pricing_request: WarehousePricingRequestRecord
	warehouse_service_details: WarehouseServiceDetailsRecord
	warehouse_service_requests: WarehouseServiceRequestsRecord
	warehouse_tariffs_request: WarehouseTariffsRequestRecord
}

export type CollectionResponses = {
	3pl_job_order: 3plJobOrderResponse
	3pl_order_movement: 3plOrderMovementResponse
	3pl_orders: 3plOrdersResponse
	3pl_pricing_request: 3plPricingRequestResponse
	3pl_service_details: 3plServiceDetailsResponse
	3pl_service_requests: 3plServiceRequestsResponse
	3pl_tariffs_request: 3plTariffsRequestResponse
	3pl_transport_movement: 3plTransportMovementResponse
	Shipping_line: ShippingLineResponse
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	allowed_service_providers: AllowedServiceProvidersResponse
	audit_logs: AuditLogsResponse
	cfs_job_order: CfsJobOrderResponse
	cfs_order_movement: CfsOrderMovementResponse
	cfs_orders: CfsOrdersResponse
	cfs_pricing_request: CfsPricingRequestResponse
	cfs_service_details: CfsServiceDetailsResponse
	cfs_service_requests: CfsServiceRequestsResponse
	chat_session: ChatSessionResponse
	containers: ContainersResponse
	custom_cfs_job_order: CustomCfsJobOrderResponse
	custom_cfs_order_movement: CustomCfsOrderMovementResponse
	custom_cfs_orders: CustomCfsOrdersResponse
	custom_cfs_service_details: CustomCfsServiceDetailsResponse
	custom_cfs_service_requests: CustomCfsServiceRequestsResponse
	custom_order_packages: CustomOrderPackagesResponse
	custom_packages: CustomPackagesResponse
	custom_pricing_request: CustomPricingRequestResponse
	custom_transport_job_order: CustomTransportJobOrderResponse
	custom_transport_order_movement: CustomTransportOrderMovementResponse
	custom_transport_orders: CustomTransportOrdersResponse
	custom_transport_service_requests: CustomTransportServiceRequestsResponse
	custom_warehouse_job_order: CustomWarehouseJobOrderResponse
	custom_warehouse_order_movement: CustomWarehouseOrderMovementResponse
	custom_warehouse_orders: CustomWarehouseOrdersResponse
	custom_warehouse_service_details: CustomWarehouseServiceDetailsResponse
	custom_warehouse_service_requests: CustomWarehouseServiceRequestsResponse
	faqs: FaqsResponse
	messages: MessagesResponse
	notification: NotificationResponse
	presence: PresenceResponse
	service_provider: ServiceProviderResponse
	services: ServicesResponse
	sub_services: SubServicesResponse
	ticket: TicketResponse
	transport_job_order: TransportJobOrderResponse
	transport_order_movement: TransportOrderMovementResponse
	transport_orders: TransportOrdersResponse
	transport_pricing_request: TransportPricingRequestResponse
	transport_service_requests: TransportServiceRequestsResponse
	user_profile: UserProfileResponse
	users: UsersResponse
	vehicles: VehiclesResponse
	warehouse_job_order: WarehouseJobOrderResponse
	warehouse_order_movement: WarehouseOrderMovementResponse
	warehouse_orders: WarehouseOrdersResponse
	warehouse_pricing_request: WarehousePricingRequestResponse
	warehouse_service_details: WarehouseServiceDetailsResponse
	warehouse_service_requests: WarehouseServiceRequestsResponse
	warehouse_tariffs_request: WarehouseTariffsRequestResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
