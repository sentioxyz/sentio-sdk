/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal.js";
import { Struct } from "../../../google/protobuf/struct.js";
import { Timestamp } from "../../../google/protobuf/timestamp.js";

export enum Tier {
  FREE = 0,
  DEV = 1,
  PRO = 2,
  ENTERPRISE = 3,
  ANONYMOUS = 16,
  UNRECOGNIZED = -1,
}

export function tierFromJSON(object: any): Tier {
  switch (object) {
    case 0:
    case "FREE":
      return Tier.FREE;
    case 1:
    case "DEV":
      return Tier.DEV;
    case 2:
    case "PRO":
      return Tier.PRO;
    case 3:
    case "ENTERPRISE":
      return Tier.ENTERPRISE;
    case 16:
    case "ANONYMOUS":
      return Tier.ANONYMOUS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Tier.UNRECOGNIZED;
  }
}

export function tierToJSON(object: Tier): string {
  switch (object) {
    case Tier.FREE:
      return "FREE";
    case Tier.DEV:
      return "DEV";
    case Tier.PRO:
      return "PRO";
    case Tier.ENTERPRISE:
      return "ENTERPRISE";
    case Tier.ANONYMOUS:
      return "ANONYMOUS";
    case Tier.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum OrganizationRole {
  ORG_MEMBER = 0,
  ORG_ADMIN = 1,
  UNRECOGNIZED = -1,
}

export function organizationRoleFromJSON(object: any): OrganizationRole {
  switch (object) {
    case 0:
    case "ORG_MEMBER":
      return OrganizationRole.ORG_MEMBER;
    case 1:
    case "ORG_ADMIN":
      return OrganizationRole.ORG_ADMIN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return OrganizationRole.UNRECOGNIZED;
  }
}

export function organizationRoleToJSON(object: OrganizationRole): string {
  switch (object) {
    case OrganizationRole.ORG_MEMBER:
      return "ORG_MEMBER";
    case OrganizationRole.ORG_ADMIN:
      return "ORG_ADMIN";
    case OrganizationRole.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum JoinOperator {
  AND = 0,
  OR = 1,
  THEN = 2,
  UNRECOGNIZED = -1,
}

export function joinOperatorFromJSON(object: any): JoinOperator {
  switch (object) {
    case 0:
    case "AND":
      return JoinOperator.AND;
    case 1:
    case "OR":
      return JoinOperator.OR;
    case 2:
    case "THEN":
      return JoinOperator.THEN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return JoinOperator.UNRECOGNIZED;
  }
}

export function joinOperatorToJSON(object: JoinOperator): string {
  switch (object) {
    case JoinOperator.AND:
      return "AND";
    case JoinOperator.OR:
      return "OR";
    case JoinOperator.THEN:
      return "THEN";
    case JoinOperator.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum Permission {
  READ = 0,
  WRITE = 1,
  ADMIN = 2,
  UNRECOGNIZED = -1,
}

export function permissionFromJSON(object: any): Permission {
  switch (object) {
    case 0:
    case "READ":
      return Permission.READ;
    case 1:
    case "WRITE":
      return Permission.WRITE;
    case 2:
    case "ADMIN":
      return Permission.ADMIN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Permission.UNRECOGNIZED;
  }
}

export function permissionToJSON(object: Permission): string {
  switch (object) {
    case Permission.READ:
      return "READ";
    case Permission.WRITE:
      return "WRITE";
    case Permission.ADMIN:
      return "ADMIN";
    case Permission.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum PayMethod {
  CREDIT_CARD = 0,
  INVOICE_FIAT = 1,
  INVOICE_CRYPTO = 2,
  UNRECOGNIZED = -1,
}

export function payMethodFromJSON(object: any): PayMethod {
  switch (object) {
    case 0:
    case "CREDIT_CARD":
      return PayMethod.CREDIT_CARD;
    case 1:
    case "INVOICE_FIAT":
      return PayMethod.INVOICE_FIAT;
    case 2:
    case "INVOICE_CRYPTO":
      return PayMethod.INVOICE_CRYPTO;
    case -1:
    case "UNRECOGNIZED":
    default:
      return PayMethod.UNRECOGNIZED;
  }
}

export function payMethodToJSON(object: PayMethod): string {
  switch (object) {
    case PayMethod.CREDIT_CARD:
      return "CREDIT_CARD";
    case PayMethod.INVOICE_FIAT:
      return "INVOICE_FIAT";
    case PayMethod.INVOICE_CRYPTO:
      return "INVOICE_CRYPTO";
    case PayMethod.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum NotificationType {
  GENERAL = 0,
  PROCESSOR_UPLOAD_FAILED = 101,
  PROCESSOR_UPLOAD_SUCCESS = 102,
  PROCESSOR_OBSOLETED = 103,
  PROCESSOR_STOPPED = 104,
  PROCESSOR_ACTIVATED = 105,
  PROCESSOR_GENERAL = 106,
  PROCESSOR_ERROR = 107,
  EXPORT_TASK_FAILED = 201,
  EXPORT_TASK_SUCCESS = 202,
  BILLING_INVOICE = 301,
  BILLING_PAYMENT = 302,
  BILLING_SUBSCRIPTION = 303,
  UNRECOGNIZED = -1,
}

export function notificationTypeFromJSON(object: any): NotificationType {
  switch (object) {
    case 0:
    case "GENERAL":
      return NotificationType.GENERAL;
    case 101:
    case "PROCESSOR_UPLOAD_FAILED":
      return NotificationType.PROCESSOR_UPLOAD_FAILED;
    case 102:
    case "PROCESSOR_UPLOAD_SUCCESS":
      return NotificationType.PROCESSOR_UPLOAD_SUCCESS;
    case 103:
    case "PROCESSOR_OBSOLETED":
      return NotificationType.PROCESSOR_OBSOLETED;
    case 104:
    case "PROCESSOR_STOPPED":
      return NotificationType.PROCESSOR_STOPPED;
    case 105:
    case "PROCESSOR_ACTIVATED":
      return NotificationType.PROCESSOR_ACTIVATED;
    case 106:
    case "PROCESSOR_GENERAL":
      return NotificationType.PROCESSOR_GENERAL;
    case 107:
    case "PROCESSOR_ERROR":
      return NotificationType.PROCESSOR_ERROR;
    case 201:
    case "EXPORT_TASK_FAILED":
      return NotificationType.EXPORT_TASK_FAILED;
    case 202:
    case "EXPORT_TASK_SUCCESS":
      return NotificationType.EXPORT_TASK_SUCCESS;
    case 301:
    case "BILLING_INVOICE":
      return NotificationType.BILLING_INVOICE;
    case 302:
    case "BILLING_PAYMENT":
      return NotificationType.BILLING_PAYMENT;
    case 303:
    case "BILLING_SUBSCRIPTION":
      return NotificationType.BILLING_SUBSCRIPTION;
    case -1:
    case "UNRECOGNIZED":
    default:
      return NotificationType.UNRECOGNIZED;
  }
}

export function notificationTypeToJSON(object: NotificationType): string {
  switch (object) {
    case NotificationType.GENERAL:
      return "GENERAL";
    case NotificationType.PROCESSOR_UPLOAD_FAILED:
      return "PROCESSOR_UPLOAD_FAILED";
    case NotificationType.PROCESSOR_UPLOAD_SUCCESS:
      return "PROCESSOR_UPLOAD_SUCCESS";
    case NotificationType.PROCESSOR_OBSOLETED:
      return "PROCESSOR_OBSOLETED";
    case NotificationType.PROCESSOR_STOPPED:
      return "PROCESSOR_STOPPED";
    case NotificationType.PROCESSOR_ACTIVATED:
      return "PROCESSOR_ACTIVATED";
    case NotificationType.PROCESSOR_GENERAL:
      return "PROCESSOR_GENERAL";
    case NotificationType.PROCESSOR_ERROR:
      return "PROCESSOR_ERROR";
    case NotificationType.EXPORT_TASK_FAILED:
      return "EXPORT_TASK_FAILED";
    case NotificationType.EXPORT_TASK_SUCCESS:
      return "EXPORT_TASK_SUCCESS";
    case NotificationType.BILLING_INVOICE:
      return "BILLING_INVOICE";
    case NotificationType.BILLING_PAYMENT:
      return "BILLING_PAYMENT";
    case NotificationType.BILLING_SUBSCRIPTION:
      return "BILLING_SUBSCRIPTION";
    case NotificationType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface UsageTracker {
  apiSku: string;
  webuiSku: string;
  projectIdField: string;
  projectSlugField: string;
  projectOwnerField: string;
  versionField: string;
}

export interface AuthChecker {
  projectIdField: string;
  projectSlugField: string;
  projectOwnerField: string;
  projectPermission: AuthChecker_Permission;
  loaderName: string;
}

export enum AuthChecker_Permission {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  ADMIN = 3,
  UNRECOGNIZED = -1,
}

export function authChecker_PermissionFromJSON(object: any): AuthChecker_Permission {
  switch (object) {
    case 0:
    case "NONE":
      return AuthChecker_Permission.NONE;
    case 1:
    case "READ":
      return AuthChecker_Permission.READ;
    case 2:
    case "WRITE":
      return AuthChecker_Permission.WRITE;
    case 3:
    case "ADMIN":
      return AuthChecker_Permission.ADMIN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AuthChecker_Permission.UNRECOGNIZED;
  }
}

export function authChecker_PermissionToJSON(object: AuthChecker_Permission): string {
  switch (object) {
    case AuthChecker_Permission.NONE:
      return "NONE";
    case AuthChecker_Permission.READ:
      return "READ";
    case AuthChecker_Permission.WRITE:
      return "WRITE";
    case AuthChecker_Permission.ADMIN:
      return "ADMIN";
    case AuthChecker_Permission.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface AccessMeta {
  projectIdField: string;
  projectSlugField: string;
  ownerIdField: string;
  ownerNameField: string;
  processorIdField: string;
  processorVersionField: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  lastName: string;
  firstName: string;
  locale: string;
  nickname: string;
  picture: string;
  sub: string;
  updatedAt: bigint;
  createdAt: bigint;
  username: string;
  accountStatus: User_AccountStatus;
  tier: Tier;
}

export enum User_AccountStatus {
  PENDING = 0,
  SET_USERNAME = 1,
  BANNED = 9,
  ACTIVE = 10,
  UNRECOGNIZED = -1,
}

export function user_AccountStatusFromJSON(object: any): User_AccountStatus {
  switch (object) {
    case 0:
    case "PENDING":
      return User_AccountStatus.PENDING;
    case 1:
    case "SET_USERNAME":
      return User_AccountStatus.SET_USERNAME;
    case 9:
    case "BANNED":
      return User_AccountStatus.BANNED;
    case 10:
    case "ACTIVE":
      return User_AccountStatus.ACTIVE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return User_AccountStatus.UNRECOGNIZED;
  }
}

export function user_AccountStatusToJSON(object: User_AccountStatus): string {
  switch (object) {
    case User_AccountStatus.PENDING:
      return "PENDING";
    case User_AccountStatus.SET_USERNAME:
      return "SET_USERNAME";
    case User_AccountStatus.BANNED:
      return "BANNED";
    case User_AccountStatus.ACTIVE:
      return "ACTIVE";
    case User_AccountStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface UserInfo {
  id: string;
  lastName: string;
  firstName: string;
  nickname: string;
  picture: string;
  username: string;
}

export interface Owner {
  user?: User | undefined;
  organization?: Organization | undefined;
  tier: Tier;
}

export interface Project {
  id: string;
  displayName: string;
  description: string;
  createdAt: bigint;
  updatedAt: bigint;
  slug: string;
  ownerId: string;
  owner: Owner | undefined;
  visibility: Project_Visibility;
  type: Project_Type;
  members: Project_ProjectMember[];
  multiVersion: boolean;
  ownerName: string;
  notificationChannels: Channel[];
  views: ProjectView[];
  /** @deprecated */
  supersetEnable: boolean;
  /** @deprecated */
  superset: ProjectSuperset | undefined;
  enableDisk: boolean;
  /** @deprecated */
  enableMaterializedView: boolean;
  defaultTimerange: TimeRangeLite | undefined;
  communityProject?: CommunityProject | undefined;
}

export enum Project_Visibility {
  PUBLIC = 0,
  PRIVATE = 1,
  UNRECOGNIZED = -1,
}

export function project_VisibilityFromJSON(object: any): Project_Visibility {
  switch (object) {
    case 0:
    case "PUBLIC":
      return Project_Visibility.PUBLIC;
    case 1:
    case "PRIVATE":
      return Project_Visibility.PRIVATE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Project_Visibility.UNRECOGNIZED;
  }
}

export function project_VisibilityToJSON(object: Project_Visibility): string {
  switch (object) {
    case Project_Visibility.PUBLIC:
      return "PUBLIC";
    case Project_Visibility.PRIVATE:
      return "PRIVATE";
    case Project_Visibility.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum Project_Type {
  SENTIO = 0,
  SUBGRAPH = 1,
  ACTION = 2,
  UNRECOGNIZED = -1,
}

export function project_TypeFromJSON(object: any): Project_Type {
  switch (object) {
    case 0:
    case "SENTIO":
      return Project_Type.SENTIO;
    case 1:
    case "SUBGRAPH":
      return Project_Type.SUBGRAPH;
    case 2:
    case "ACTION":
      return Project_Type.ACTION;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Project_Type.UNRECOGNIZED;
  }
}

export function project_TypeToJSON(object: Project_Type): string {
  switch (object) {
    case Project_Type.SENTIO:
      return "SENTIO";
    case Project_Type.SUBGRAPH:
      return "SUBGRAPH";
    case Project_Type.ACTION:
      return "ACTION";
    case Project_Type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Project_ProjectMember {
  user: UserInfo | undefined;
  role: string;
}

export interface CommunityProject {
  dashAlias: string;
  curated?: boolean | undefined;
}

export interface ProjectInfo {
  id: string;
  displayName: string;
  description: string;
  createdAt: bigint;
  updatedAt: bigint;
  slug: string;
  owner: string;
  visibility: Project_Visibility;
  type: Project_Type;
  multiVersion: boolean;
  /** @deprecated */
  supersetEnable: boolean;
  /** @deprecated */
  superset: ProjectSuperset | undefined;
  enableDisk: boolean;
  /** @deprecated */
  enableMaterializedView: boolean;
  defaultTimerange: TimeRangeLite | undefined;
}

export interface EventLogColumn {
  id: string;
  size: number;
  name: string;
  accessorKey: string;
  enableHiding: boolean;
  enableSorting: boolean;
  enableResizing: boolean;
}

export interface ColumnState {
  columnSizing: { [key: string]: number };
  columnVisibility: { [key: string]: boolean };
  columnOrder: string[];
  sorting: ColumnState_Sort[];
}

export interface ColumnState_ColumnSizingEntry {
  key: string;
  value: number;
}

export interface ColumnState_ColumnVisibilityEntry {
  key: string;
  value: boolean;
}

export interface ColumnState_Sort {
  id: string;
  desc: boolean;
}

export interface EventLogConfig {
  columns: EventLogColumn[];
  state: ColumnState | undefined;
}

export interface ProjectView {
  id: string;
  projectId: string;
  name: string;
  config: ProjectView_ProjectViewConfig | undefined;
}

export interface ProjectView_ProjectViewConfig {
  eventLog: EventLogConfig | undefined;
}

export interface Organization {
  id: string;
  oid: string;
  name: string;
  createdAt: bigint;
  updatedAt: bigint;
  members: Organization_Member[];
  displayName: string;
  logoUrl: string;
  projects: ProjectInfo[];
  tier: Tier;
}

export interface Organization_Member {
  user: UserInfo | undefined;
  role: OrganizationRole;
}

export interface ApiKey {
  id: string;
  name: string;
  ownerId: string;
  scopes: string[];
  createdAt: bigint;
  updatedAt: bigint;
  expiresAt: bigint;
  source: string;
  ownerType: string;
  revealable: boolean;
  scopeProjects: { [key: string]: ProjectInfo };
}

export interface ApiKey_ScopeProjectsEntry {
  key: string;
  value: ProjectInfo | undefined;
}

export interface TimeRangeLite {
  start: string;
  end: string;
  step: number;
  timezone: string;
}

export interface TimeRange {
  start: TimeRange_TimeLike | undefined;
  end: TimeRange_TimeLike | undefined;
  step: bigint;
  interval: Duration | undefined;
  timezone: string;
}

export interface TimeRange_TimeLike {
  relativeTime?: TimeRange_RelativeTime | undefined;
  absoluteTime?: bigint | undefined;
}

export interface TimeRange_RelativeTime {
  unit: string;
  value: number;
  align: string;
}

export interface Duration {
  value: number;
  unit: string;
}

export interface Formula {
  expression: string;
  alias: string;
  id: string;
  disabled: boolean;
  functions: Function[];
  color: string;
}

export interface Argument {
  stringValue?: string | undefined;
  intValue?: number | undefined;
  doubleValue?: number | undefined;
  boolValue?: boolean | undefined;
  durationValue?: Duration | undefined;
}

export interface Function {
  name: string;
  arguments: Argument[];
}

export interface Query {
  query: string;
  alias: string;
  id: string;
  labelSelector: { [key: string]: string };
  aggregate: Aggregate | undefined;
  functions: Function[];
  color: string;
  disabled: boolean;
}

export interface Query_LabelSelectorEntry {
  key: string;
  value: string;
}

export interface Aggregate {
  op: Aggregate_AggregateOps;
  grouping: string[];
}

export enum Aggregate_AggregateOps {
  AVG = 0,
  SUM = 1,
  MIN = 2,
  MAX = 3,
  COUNT = 4,
  UNRECOGNIZED = -1,
}

export function aggregate_AggregateOpsFromJSON(object: any): Aggregate_AggregateOps {
  switch (object) {
    case 0:
    case "AVG":
      return Aggregate_AggregateOps.AVG;
    case 1:
    case "SUM":
      return Aggregate_AggregateOps.SUM;
    case 2:
    case "MIN":
      return Aggregate_AggregateOps.MIN;
    case 3:
    case "MAX":
      return Aggregate_AggregateOps.MAX;
    case 4:
    case "COUNT":
      return Aggregate_AggregateOps.COUNT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Aggregate_AggregateOps.UNRECOGNIZED;
  }
}

export function aggregate_AggregateOpsToJSON(object: Aggregate_AggregateOps): string {
  switch (object) {
    case Aggregate_AggregateOps.AVG:
      return "AVG";
    case Aggregate_AggregateOps.SUM:
      return "SUM";
    case Aggregate_AggregateOps.MIN:
      return "MIN";
    case Aggregate_AggregateOps.MAX:
      return "MAX";
    case Aggregate_AggregateOps.COUNT:
      return "COUNT";
    case Aggregate_AggregateOps.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Selector {
  key: string;
  operator: Selector_OperatorType;
  value: Any[];
}

export enum Selector_OperatorType {
  EQ = 0,
  NEQ = 1,
  EXISTS = 9,
  NOT_EXISTS = 10,
  GT = 2,
  GTE = 3,
  LT = 4,
  LTE = 5,
  BETWEEN = 7,
  NOT_BETWEEN = 8,
  CONTAINS = 11,
  NOT_CONTAINS = 12,
  IN_COHORTS = 13,
  NOT_IN_COHORTS = 14,
  UNRECOGNIZED = -1,
}

export function selector_OperatorTypeFromJSON(object: any): Selector_OperatorType {
  switch (object) {
    case 0:
    case "EQ":
      return Selector_OperatorType.EQ;
    case 1:
    case "NEQ":
      return Selector_OperatorType.NEQ;
    case 9:
    case "EXISTS":
      return Selector_OperatorType.EXISTS;
    case 10:
    case "NOT_EXISTS":
      return Selector_OperatorType.NOT_EXISTS;
    case 2:
    case "GT":
      return Selector_OperatorType.GT;
    case 3:
    case "GTE":
      return Selector_OperatorType.GTE;
    case 4:
    case "LT":
      return Selector_OperatorType.LT;
    case 5:
    case "LTE":
      return Selector_OperatorType.LTE;
    case 7:
    case "BETWEEN":
      return Selector_OperatorType.BETWEEN;
    case 8:
    case "NOT_BETWEEN":
      return Selector_OperatorType.NOT_BETWEEN;
    case 11:
    case "CONTAINS":
      return Selector_OperatorType.CONTAINS;
    case 12:
    case "NOT_CONTAINS":
      return Selector_OperatorType.NOT_CONTAINS;
    case 13:
    case "IN_COHORTS":
      return Selector_OperatorType.IN_COHORTS;
    case 14:
    case "NOT_IN_COHORTS":
      return Selector_OperatorType.NOT_IN_COHORTS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Selector_OperatorType.UNRECOGNIZED;
  }
}

export function selector_OperatorTypeToJSON(object: Selector_OperatorType): string {
  switch (object) {
    case Selector_OperatorType.EQ:
      return "EQ";
    case Selector_OperatorType.NEQ:
      return "NEQ";
    case Selector_OperatorType.EXISTS:
      return "EXISTS";
    case Selector_OperatorType.NOT_EXISTS:
      return "NOT_EXISTS";
    case Selector_OperatorType.GT:
      return "GT";
    case Selector_OperatorType.GTE:
      return "GTE";
    case Selector_OperatorType.LT:
      return "LT";
    case Selector_OperatorType.LTE:
      return "LTE";
    case Selector_OperatorType.BETWEEN:
      return "BETWEEN";
    case Selector_OperatorType.NOT_BETWEEN:
      return "NOT_BETWEEN";
    case Selector_OperatorType.CONTAINS:
      return "CONTAINS";
    case Selector_OperatorType.NOT_CONTAINS:
      return "NOT_CONTAINS";
    case Selector_OperatorType.IN_COHORTS:
      return "IN_COHORTS";
    case Selector_OperatorType.NOT_IN_COHORTS:
      return "NOT_IN_COHORTS";
    case Selector_OperatorType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface SelectorExpr {
  selector?: Selector | undefined;
  logicExpr?: SelectorExpr_LogicExpr | undefined;
}

export interface SelectorExpr_LogicExpr {
  expressions: SelectorExpr[];
  operator: JoinOperator;
}

export interface CohortsGroup {
  joinOperator: JoinOperator;
  filters: CohortsFilter[];
}

export interface CohortsQuery {
  joinOperator: JoinOperator;
  groups: CohortsGroup[];
  name: string;
  id: string;
}

export interface SegmentationQuery {
  resource: SegmentationQuery_Resource | undefined;
  alias: string;
  id: string;
  aggregation: SegmentationQuery_Aggregation | undefined;
  selectorExpr: SegmentationQuery_SelectorExpr | undefined;
  groupBy: string[];
  limit: number;
  functions: Function[];
  color: string;
  disabled: boolean;
}

export enum SegmentationQuery_ResourceType {
  EVENTS = 0,
  COHORTS = 1,
  UNRECOGNIZED = -1,
}

export function segmentationQuery_ResourceTypeFromJSON(object: any): SegmentationQuery_ResourceType {
  switch (object) {
    case 0:
    case "EVENTS":
      return SegmentationQuery_ResourceType.EVENTS;
    case 1:
    case "COHORTS":
      return SegmentationQuery_ResourceType.COHORTS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SegmentationQuery_ResourceType.UNRECOGNIZED;
  }
}

export function segmentationQuery_ResourceTypeToJSON(object: SegmentationQuery_ResourceType): string {
  switch (object) {
    case SegmentationQuery_ResourceType.EVENTS:
      return "EVENTS";
    case SegmentationQuery_ResourceType.COHORTS:
      return "COHORTS";
    case SegmentationQuery_ResourceType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface SegmentationQuery_Resource {
  name: string;
  type: SegmentationQuery_ResourceType;
  cohortsId?: string | undefined;
  cohortsQuery?: CohortsQuery | undefined;
}

export interface SegmentationQuery_Aggregation {
  total?: SegmentationQuery_Aggregation_Total | undefined;
  unique?: SegmentationQuery_Aggregation_Unique | undefined;
  countUnique?: SegmentationQuery_Aggregation_CountUnique | undefined;
  aggregateProperties?: SegmentationQuery_Aggregation_AggregateProperties | undefined;
}

export interface SegmentationQuery_Aggregation_Total {
}

export interface SegmentationQuery_Aggregation_Unique {
}

export interface SegmentationQuery_Aggregation_CountUnique {
  duration: Duration | undefined;
}

export interface SegmentationQuery_Aggregation_AggregateProperties {
  type: SegmentationQuery_Aggregation_AggregateProperties_AggregationType;
  propertyName: string;
}

export enum SegmentationQuery_Aggregation_AggregateProperties_AggregationType {
  SUM = 0,
  CUMULATIVE_SUM = 6,
  AVG = 1,
  MEDIAN = 2,
  MIN = 3,
  MAX = 4,
  DISTINCT_COUNT = 5,
  CUMULATIVE_DISTINCT_COUNT = 9,
  CUMULATIVE_COUNT = 12,
  LAST = 7,
  CUMULATIVE_LAST = 10,
  FIRST = 8,
  CUMULATIVE_FIRST = 11,
  PERCENTILE_25TH = 20,
  PERCENTILE_75TH = 21,
  PERCENTILE_90TH = 22,
  PERCENTILE_95TH = 23,
  PERCENTILE_99TH = 24,
  UNRECOGNIZED = -1,
}

export function segmentationQuery_Aggregation_AggregateProperties_AggregationTypeFromJSON(
  object: any,
): SegmentationQuery_Aggregation_AggregateProperties_AggregationType {
  switch (object) {
    case 0:
    case "SUM":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.SUM;
    case 6:
    case "CUMULATIVE_SUM":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_SUM;
    case 1:
    case "AVG":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.AVG;
    case 2:
    case "MEDIAN":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.MEDIAN;
    case 3:
    case "MIN":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.MIN;
    case 4:
    case "MAX":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.MAX;
    case 5:
    case "DISTINCT_COUNT":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.DISTINCT_COUNT;
    case 9:
    case "CUMULATIVE_DISTINCT_COUNT":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_DISTINCT_COUNT;
    case 12:
    case "CUMULATIVE_COUNT":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_COUNT;
    case 7:
    case "LAST":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.LAST;
    case 10:
    case "CUMULATIVE_LAST":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_LAST;
    case 8:
    case "FIRST":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.FIRST;
    case 11:
    case "CUMULATIVE_FIRST":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_FIRST;
    case 20:
    case "PERCENTILE_25TH":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_25TH;
    case 21:
    case "PERCENTILE_75TH":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_75TH;
    case 22:
    case "PERCENTILE_90TH":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_90TH;
    case 23:
    case "PERCENTILE_95TH":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_95TH;
    case 24:
    case "PERCENTILE_99TH":
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_99TH;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SegmentationQuery_Aggregation_AggregateProperties_AggregationType.UNRECOGNIZED;
  }
}

export function segmentationQuery_Aggregation_AggregateProperties_AggregationTypeToJSON(
  object: SegmentationQuery_Aggregation_AggregateProperties_AggregationType,
): string {
  switch (object) {
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.SUM:
      return "SUM";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_SUM:
      return "CUMULATIVE_SUM";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.AVG:
      return "AVG";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.MEDIAN:
      return "MEDIAN";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.MIN:
      return "MIN";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.MAX:
      return "MAX";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.DISTINCT_COUNT:
      return "DISTINCT_COUNT";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_DISTINCT_COUNT:
      return "CUMULATIVE_DISTINCT_COUNT";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_COUNT:
      return "CUMULATIVE_COUNT";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.LAST:
      return "LAST";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_LAST:
      return "CUMULATIVE_LAST";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.FIRST:
      return "FIRST";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.CUMULATIVE_FIRST:
      return "CUMULATIVE_FIRST";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_25TH:
      return "PERCENTILE_25TH";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_75TH:
      return "PERCENTILE_75TH";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_90TH:
      return "PERCENTILE_90TH";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_95TH:
      return "PERCENTILE_95TH";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.PERCENTILE_99TH:
      return "PERCENTILE_99TH";
    case SegmentationQuery_Aggregation_AggregateProperties_AggregationType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface SegmentationQuery_SelectorExpr {
  selector?: Selector | undefined;
  logicExpr?: SegmentationQuery_SelectorExpr_LogicExpr | undefined;
}

export interface SegmentationQuery_SelectorExpr_LogicExpr {
  expressions: SegmentationQuery_SelectorExpr[];
  operator: JoinOperator;
}

export interface CohortsFilter {
  symbol: boolean;
  name: string;
  aggregation: CohortsFilter_Aggregation | undefined;
  selectorExpr: SelectorExpr | undefined;
  timeRange: TimeRangeLite | undefined;
}

export interface CohortsFilter_Aggregation {
  total?: CohortsFilter_Aggregation_Total | undefined;
  aggregateProperties?: CohortsFilter_Aggregation_AggregateProperties | undefined;
  operator: CohortsFilter_Aggregation_OperatorType;
  value: Any[];
}

export enum CohortsFilter_Aggregation_OperatorType {
  EQ = 0,
  NEQ = 1,
  GT = 2,
  GTE = 3,
  LT = 4,
  LTE = 5,
  BETWEEN = 7,
  NOT_BETWEEN = 8,
  UNRECOGNIZED = -1,
}

export function cohortsFilter_Aggregation_OperatorTypeFromJSON(object: any): CohortsFilter_Aggregation_OperatorType {
  switch (object) {
    case 0:
    case "EQ":
      return CohortsFilter_Aggregation_OperatorType.EQ;
    case 1:
    case "NEQ":
      return CohortsFilter_Aggregation_OperatorType.NEQ;
    case 2:
    case "GT":
      return CohortsFilter_Aggregation_OperatorType.GT;
    case 3:
    case "GTE":
      return CohortsFilter_Aggregation_OperatorType.GTE;
    case 4:
    case "LT":
      return CohortsFilter_Aggregation_OperatorType.LT;
    case 5:
    case "LTE":
      return CohortsFilter_Aggregation_OperatorType.LTE;
    case 7:
    case "BETWEEN":
      return CohortsFilter_Aggregation_OperatorType.BETWEEN;
    case 8:
    case "NOT_BETWEEN":
      return CohortsFilter_Aggregation_OperatorType.NOT_BETWEEN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return CohortsFilter_Aggregation_OperatorType.UNRECOGNIZED;
  }
}

export function cohortsFilter_Aggregation_OperatorTypeToJSON(object: CohortsFilter_Aggregation_OperatorType): string {
  switch (object) {
    case CohortsFilter_Aggregation_OperatorType.EQ:
      return "EQ";
    case CohortsFilter_Aggregation_OperatorType.NEQ:
      return "NEQ";
    case CohortsFilter_Aggregation_OperatorType.GT:
      return "GT";
    case CohortsFilter_Aggregation_OperatorType.GTE:
      return "GTE";
    case CohortsFilter_Aggregation_OperatorType.LT:
      return "LT";
    case CohortsFilter_Aggregation_OperatorType.LTE:
      return "LTE";
    case CohortsFilter_Aggregation_OperatorType.BETWEEN:
      return "BETWEEN";
    case CohortsFilter_Aggregation_OperatorType.NOT_BETWEEN:
      return "NOT_BETWEEN";
    case CohortsFilter_Aggregation_OperatorType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface CohortsFilter_Aggregation_Total {
}

export interface CohortsFilter_Aggregation_AggregateProperties {
  type: CohortsFilter_Aggregation_AggregateProperties_AggregationType;
  propertyName: string;
}

export enum CohortsFilter_Aggregation_AggregateProperties_AggregationType {
  SUM = 0,
  AVG = 1,
  MEDIAN = 2,
  MIN = 3,
  MAX = 4,
  DISTINCT_COUNT = 5,
  LAST = 6,
  FIRST = 7,
  UNRECOGNIZED = -1,
}

export function cohortsFilter_Aggregation_AggregateProperties_AggregationTypeFromJSON(
  object: any,
): CohortsFilter_Aggregation_AggregateProperties_AggregationType {
  switch (object) {
    case 0:
    case "SUM":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.SUM;
    case 1:
    case "AVG":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.AVG;
    case 2:
    case "MEDIAN":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.MEDIAN;
    case 3:
    case "MIN":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.MIN;
    case 4:
    case "MAX":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.MAX;
    case 5:
    case "DISTINCT_COUNT":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.DISTINCT_COUNT;
    case 6:
    case "LAST":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.LAST;
    case 7:
    case "FIRST":
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.FIRST;
    case -1:
    case "UNRECOGNIZED":
    default:
      return CohortsFilter_Aggregation_AggregateProperties_AggregationType.UNRECOGNIZED;
  }
}

export function cohortsFilter_Aggregation_AggregateProperties_AggregationTypeToJSON(
  object: CohortsFilter_Aggregation_AggregateProperties_AggregationType,
): string {
  switch (object) {
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.SUM:
      return "SUM";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.AVG:
      return "AVG";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.MEDIAN:
      return "MEDIAN";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.MIN:
      return "MIN";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.MAX:
      return "MAX";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.DISTINCT_COUNT:
      return "DISTINCT_COUNT";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.LAST:
      return "LAST";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.FIRST:
      return "FIRST";
    case CohortsFilter_Aggregation_AggregateProperties_AggregationType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Contract {
  address: string;
  name: string;
  chainId: string;
  id: string;
  source: Contract_Source;
}

export enum Contract_Source {
  PROCESSOR = 0,
  UI = 1,
  UNRECOGNIZED = -1,
}

export function contract_SourceFromJSON(object: any): Contract_Source {
  switch (object) {
    case 0:
    case "PROCESSOR":
      return Contract_Source.PROCESSOR;
    case 1:
    case "UI":
      return Contract_Source.UI;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Contract_Source.UNRECOGNIZED;
  }
}

export function contract_SourceToJSON(object: Contract_Source): string {
  switch (object) {
    case Contract_Source.PROCESSOR:
      return "PROCESSOR";
    case Contract_Source.UI:
      return "UI";
    case Contract_Source.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface ErrorRecord {
  id: string;
  namespace: number;
  code: number;
  namespaceCode: number;
  message: string;
  createdAt: Date | undefined;
}

export interface StringList {
  values: string[];
}

export interface Any {
  intValue?: number | undefined;
  longValue?: bigint | undefined;
  doubleValue?: number | undefined;
  stringValue?: string | undefined;
  boolValue?: boolean | undefined;
  dateValue?: Date | undefined;
  listValue?: StringList | undefined;
}

export interface Channel {
  id: string;
  projectId: string;
  type: Channel_Type;
  slackWebhookUrl: string;
  emailAddress: string;
  name: string;
  customWebhookUrl: string;
  customHeaders: { [key: string]: string };
  telegramReference: string;
  telegramChatId: string;
  slackTeam: string;
  slackChannel: string;
  pagerdutyConfig: { [key: string]: any } | undefined;
}

export enum Channel_Type {
  UNKNOWN = 0,
  EMAIL = 1,
  SLACK = 2,
  TELEGRAM = 3,
  WEBHOOK = 4,
  DISCORD = 5,
  PAGERDUTY = 6,
  UNRECOGNIZED = -1,
}

export function channel_TypeFromJSON(object: any): Channel_Type {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return Channel_Type.UNKNOWN;
    case 1:
    case "EMAIL":
      return Channel_Type.EMAIL;
    case 2:
    case "SLACK":
      return Channel_Type.SLACK;
    case 3:
    case "TELEGRAM":
      return Channel_Type.TELEGRAM;
    case 4:
    case "WEBHOOK":
      return Channel_Type.WEBHOOK;
    case 5:
    case "DISCORD":
      return Channel_Type.DISCORD;
    case 6:
    case "PAGERDUTY":
      return Channel_Type.PAGERDUTY;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Channel_Type.UNRECOGNIZED;
  }
}

export function channel_TypeToJSON(object: Channel_Type): string {
  switch (object) {
    case Channel_Type.UNKNOWN:
      return "UNKNOWN";
    case Channel_Type.EMAIL:
      return "EMAIL";
    case Channel_Type.SLACK:
      return "SLACK";
    case Channel_Type.TELEGRAM:
      return "TELEGRAM";
    case Channel_Type.WEBHOOK:
      return "WEBHOOK";
    case Channel_Type.DISCORD:
      return "DISCORD";
    case Channel_Type.PAGERDUTY:
      return "PAGERDUTY";
    case Channel_Type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Channel_CustomHeadersEntry {
  key: string;
  value: string;
}

export interface EventLogEntry {
  message: string;
  timestamp: bigint;
  logLevel: string;
  logType: string;
  contractName: string;
  contractAddress: string;
  blockNumber: bigint;
  chainId: string;
  attributes: { [key: string]: any } | undefined;
  id: string;
  transactionHash: string;
  highlightedMessage: string;
  distinctId: string;
  eventName: string;
  logIndex: number;
  transactionIndex: number;
}

export interface Matrix {
  samples: Matrix_Sample[];
  totalSamples: number;
}

export interface Matrix_Sample {
  metric: Matrix_Metric | undefined;
  values: Matrix_Value[];
}

export interface Matrix_Metric {
  name: string;
  labels: { [key: string]: string };
  displayName: string;
}

export interface Matrix_Metric_LabelsEntry {
  key: string;
  value: string;
}

export interface Matrix_Value {
  timestamp: bigint;
  value: number;
}

export interface DashboardSharingRequest {
  sharingId: string;
  panelId: string;
  samplesLimit: number;
  timeRange: TimeRangeLite | undefined;
  version: number;
  variables: { [key: string]: any } | undefined;
  samplesOffset: number;
}

export interface UserUsage {
  tier: Tier;
  projects: number;
  alerts: number;
  usageByProjects: { [key: string]: UserUsage_ProjectUsage };
}

export interface UserUsage_ProjectUsage {
  owner: string;
  slug: string;
  cost: bigint;
}

export interface UserUsage_UsageByProjectsEntry {
  key: string;
  value: UserUsage_ProjectUsage | undefined;
}

export interface CoinID {
  symbol?: string | undefined;
  address?: CoinID_AddressIdentifier | undefined;
}

export interface CoinID_AddressIdentifier {
  address: string;
  chain: string;
}

export interface PriceSegmentationQuery {
  id: string;
  alias: string;
  coinId: CoinID[];
  color: string;
  disabled: boolean;
}

export interface TabularData {
  columns: string[];
  columnTypes: { [key: string]: TabularData_ColumnType };
  rows: { [key: string]: any }[];
  generatedAt: Date | undefined;
  cursor: string;
}

export enum TabularData_ColumnType {
  STRING = 0,
  NUMBER = 1,
  BOOLEAN = 2,
  LIST = 3,
  TIME = 4,
  MAP = 5,
  JSON = 6,
  TOKEN = 7,
  DYNAMIC = 8,
  UNRECOGNIZED = -1,
}

export function tabularData_ColumnTypeFromJSON(object: any): TabularData_ColumnType {
  switch (object) {
    case 0:
    case "STRING":
      return TabularData_ColumnType.STRING;
    case 1:
    case "NUMBER":
      return TabularData_ColumnType.NUMBER;
    case 2:
    case "BOOLEAN":
      return TabularData_ColumnType.BOOLEAN;
    case 3:
    case "LIST":
      return TabularData_ColumnType.LIST;
    case 4:
    case "TIME":
      return TabularData_ColumnType.TIME;
    case 5:
    case "MAP":
      return TabularData_ColumnType.MAP;
    case 6:
    case "JSON":
      return TabularData_ColumnType.JSON;
    case 7:
    case "TOKEN":
      return TabularData_ColumnType.TOKEN;
    case 8:
    case "DYNAMIC":
      return TabularData_ColumnType.DYNAMIC;
    case -1:
    case "UNRECOGNIZED":
    default:
      return TabularData_ColumnType.UNRECOGNIZED;
  }
}

export function tabularData_ColumnTypeToJSON(object: TabularData_ColumnType): string {
  switch (object) {
    case TabularData_ColumnType.STRING:
      return "STRING";
    case TabularData_ColumnType.NUMBER:
      return "NUMBER";
    case TabularData_ColumnType.BOOLEAN:
      return "BOOLEAN";
    case TabularData_ColumnType.LIST:
      return "LIST";
    case TabularData_ColumnType.TIME:
      return "TIME";
    case TabularData_ColumnType.MAP:
      return "MAP";
    case TabularData_ColumnType.JSON:
      return "JSON";
    case TabularData_ColumnType.TOKEN:
      return "TOKEN";
    case TabularData_ColumnType.DYNAMIC:
      return "DYNAMIC";
    case TabularData_ColumnType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface TabularData_ColumnTypesEntry {
  key: string;
  value: TabularData_ColumnType;
}

export interface Account {
  name: string;
  id: string;
  contact: string;
  paymentInfo: { [key: string]: any } | undefined;
  ownerId: string;
  owner: Owner | undefined;
  address: string;
  paymentMethod: PayMethod;
  usageOverCapLimit: string;
  status: string;
}

export interface ImportedProject {
  name: string;
  project: Project | undefined;
  imported: Project | undefined;
}

export interface ProjectSuperset {
  projectId: string;
  createdAt: Date | undefined;
  syncAt: Date | undefined;
}

export interface SegmentParameter {
  cohortId?: string | undefined;
  allUsers?: boolean | undefined;
}

export interface RetentionQuery {
  resources: RetentionQuery_Resource[];
  criteria: RetentionQuery_Criteria;
  interval: RetentionQuery_Interval | undefined;
  selectorExpr: SelectorExpr | undefined;
  groupBy: string[];
  segmentBy: SegmentParameter[];
  windowSize: number;
}

export enum RetentionQuery_Criteria {
  OnOrAfter = 0,
  On = 1,
  UNRECOGNIZED = -1,
}

export function retentionQuery_CriteriaFromJSON(object: any): RetentionQuery_Criteria {
  switch (object) {
    case 0:
    case "OnOrAfter":
      return RetentionQuery_Criteria.OnOrAfter;
    case 1:
    case "On":
      return RetentionQuery_Criteria.On;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RetentionQuery_Criteria.UNRECOGNIZED;
  }
}

export function retentionQuery_CriteriaToJSON(object: RetentionQuery_Criteria): string {
  switch (object) {
    case RetentionQuery_Criteria.OnOrAfter:
      return "OnOrAfter";
    case RetentionQuery_Criteria.On:
      return "On";
    case RetentionQuery_Criteria.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface RetentionQuery_Filter {
  propertyFilter: SelectorExpr | undefined;
  timeFilter: RetentionQuery_Filter_TimeFilter | undefined;
}

export interface RetentionQuery_Filter_TimeFilter {
  type: RetentionQuery_Filter_TimeFilter_Type;
}

export enum RetentionQuery_Filter_TimeFilter_Type {
  Disable = 0,
  FirstInTimeRange = 1,
  FirstInGlobal = 2,
  UNRECOGNIZED = -1,
}

export function retentionQuery_Filter_TimeFilter_TypeFromJSON(object: any): RetentionQuery_Filter_TimeFilter_Type {
  switch (object) {
    case 0:
    case "Disable":
      return RetentionQuery_Filter_TimeFilter_Type.Disable;
    case 1:
    case "FirstInTimeRange":
      return RetentionQuery_Filter_TimeFilter_Type.FirstInTimeRange;
    case 2:
    case "FirstInGlobal":
      return RetentionQuery_Filter_TimeFilter_Type.FirstInGlobal;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RetentionQuery_Filter_TimeFilter_Type.UNRECOGNIZED;
  }
}

export function retentionQuery_Filter_TimeFilter_TypeToJSON(object: RetentionQuery_Filter_TimeFilter_Type): string {
  switch (object) {
    case RetentionQuery_Filter_TimeFilter_Type.Disable:
      return "Disable";
    case RetentionQuery_Filter_TimeFilter_Type.FirstInTimeRange:
      return "FirstInTimeRange";
    case RetentionQuery_Filter_TimeFilter_Type.FirstInGlobal:
      return "FirstInGlobal";
    case RetentionQuery_Filter_TimeFilter_Type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface RetentionQuery_Resource {
  eventNames: string[];
  filter: RetentionQuery_Filter | undefined;
}

export interface RetentionQuery_Interval {
  value: number;
  unit: RetentionQuery_Interval_Unit;
}

export enum RetentionQuery_Interval_Unit {
  Day = 0,
  Week = 1,
  Month = 2,
  UNRECOGNIZED = -1,
}

export function retentionQuery_Interval_UnitFromJSON(object: any): RetentionQuery_Interval_Unit {
  switch (object) {
    case 0:
    case "Day":
      return RetentionQuery_Interval_Unit.Day;
    case 1:
    case "Week":
      return RetentionQuery_Interval_Unit.Week;
    case 2:
    case "Month":
      return RetentionQuery_Interval_Unit.Month;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RetentionQuery_Interval_Unit.UNRECOGNIZED;
  }
}

export function retentionQuery_Interval_UnitToJSON(object: RetentionQuery_Interval_Unit): string {
  switch (object) {
    case RetentionQuery_Interval_Unit.Day:
      return "Day";
    case RetentionQuery_Interval_Unit.Week:
      return "Week";
    case RetentionQuery_Interval_Unit.Month:
      return "Month";
    case RetentionQuery_Interval_Unit.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface RetentionMatrix {
  samples: RetentionMatrix_Sample[];
}

export interface RetentionMatrix_Sample {
  time: Date | undefined;
  segmentParameter: SegmentParameter | undefined;
  labels: { [key: string]: string };
  totalCount: number;
  counts: number[];
  rates: number[];
}

export interface RetentionMatrix_Sample_LabelsEntry {
  key: string;
  value: string;
}

export interface ComputeStats {
  computedAt: Date | undefined;
  computeCostMs: bigint;
  binaryVersionHash: bigint;
  computedBy: string;
  isCached: boolean;
  isRefreshing: boolean;
  clickhouseStats: ComputeStats_ClickhouseStats | undefined;
}

export interface ComputeStats_ClickhouseStats {
  readRows: bigint;
  readBytes: bigint;
  memoryUsage: bigint;
  queryDurationMs: bigint;
  resultRows: bigint;
  resultBytes: bigint;
}

export interface ClickhouseStatus {
  mutations: { [key: number]: ClickhouseStatus_Mutation };
  processes: { [key: number]: ClickhouseStatus_Processes };
}

export interface ClickhouseStatus_Mutation {
  undoneCnt: number;
}

export interface ClickhouseStatus_Process {
  query: string;
  queryKind: string;
  elapsed: number;
}

export interface ClickhouseStatus_Processes {
  processes: ClickhouseStatus_Process[];
}

export interface ClickhouseStatus_MutationsEntry {
  key: number;
  value: ClickhouseStatus_Mutation | undefined;
}

export interface ClickhouseStatus_ProcessesEntry {
  key: number;
  value: ClickhouseStatus_Processes | undefined;
}

export interface ProjectVariables {
  projectId: string;
  variables: ProjectVariables_Variable[];
}

export interface ProjectVariables_Variable {
  key: string;
  value: string;
  isSecret: boolean;
  updatedAt: Date | undefined;
}

export interface CachePolicy {
  cacheTtlSecs: number;
  cacheRefreshTtlSecs: number;
  forceRefresh: boolean;
  noCache: boolean;
}

export interface SystemSQLQuery {
  id: string;
  alias: string;
  name: string;
  tableName: string;
  aggregation: SystemSQLQuery_Aggregation | undefined;
  selectorExpr: SelectorExpr | undefined;
  groupBy: string[];
  disabled: boolean;
}

export interface SystemSQLQuery_Aggregation {
  total?: SystemSQLQuery_Aggregation_Total | undefined;
  countUnique?: SystemSQLQuery_Aggregation_CountUnique | undefined;
  aggregateProperties?: SystemSQLQuery_Aggregation_AggregateProperties | undefined;
}

export interface SystemSQLQuery_Aggregation_Total {
}

export interface SystemSQLQuery_Aggregation_CountUnique {
  duration: Duration | undefined;
}

export interface SystemSQLQuery_Aggregation_AggregateProperties {
  type: SystemSQLQuery_Aggregation_AggregateProperties_AggregationType;
  propertyName: string;
}

export enum SystemSQLQuery_Aggregation_AggregateProperties_AggregationType {
  SUM = 0,
  AVG = 1,
  MEDIAN = 2,
  MIN = 3,
  MAX = 4,
  DISTINCT_COUNT = 5,
  UNRECOGNIZED = -1,
}

export function systemSQLQuery_Aggregation_AggregateProperties_AggregationTypeFromJSON(
  object: any,
): SystemSQLQuery_Aggregation_AggregateProperties_AggregationType {
  switch (object) {
    case 0:
    case "SUM":
      return SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.SUM;
    case 1:
    case "AVG":
      return SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.AVG;
    case 2:
    case "MEDIAN":
      return SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.MEDIAN;
    case 3:
    case "MIN":
      return SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.MIN;
    case 4:
    case "MAX":
      return SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.MAX;
    case 5:
    case "DISTINCT_COUNT":
      return SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.DISTINCT_COUNT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.UNRECOGNIZED;
  }
}

export function systemSQLQuery_Aggregation_AggregateProperties_AggregationTypeToJSON(
  object: SystemSQLQuery_Aggregation_AggregateProperties_AggregationType,
): string {
  switch (object) {
    case SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.SUM:
      return "SUM";
    case SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.AVG:
      return "AVG";
    case SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.MEDIAN:
      return "MEDIAN";
    case SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.MIN:
      return "MIN";
    case SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.MAX:
      return "MAX";
    case SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.DISTINCT_COUNT:
      return "DISTINCT_COUNT";
    case SystemSQLQuery_Aggregation_AggregateProperties_AggregationType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Notification {
  id: string;
  projectId: string;
  source: string;
  level: string;
  message: string;
  createdAt: Date | undefined;
  type: NotificationType;
  ownerId: string;
  owner: Owner | undefined;
  project: Project | undefined;
  attributes: { [key: string]: string };
  read: boolean;
  repeat: number;
}

export interface Notification_AttributesEntry {
  key: string;
  value: string;
}

export interface RichValue {
  nullValue?: RichValue_NullValue | undefined;
  intValue?: number | undefined;
  int64Value?: bigint | undefined;
  floatValue?: number | undefined;
  bytesValue?: Uint8Array | undefined;
  boolValue?: boolean | undefined;
  stringValue?: string | undefined;
  timestampValue?: Date | undefined;
  bigintValue?: BigInteger | undefined;
  bigdecimalValue?: BigDecimal | undefined;
  listValue?: RichValueList | undefined;
  structValue?: RichStruct | undefined;
  tokenValue?: TokenAmount | undefined;
}

export enum RichValue_NullValue {
  NULL_VALUE = 0,
  UNRECOGNIZED = -1,
}

export function richValue_NullValueFromJSON(object: any): RichValue_NullValue {
  switch (object) {
    case 0:
    case "NULL_VALUE":
      return RichValue_NullValue.NULL_VALUE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RichValue_NullValue.UNRECOGNIZED;
  }
}

export function richValue_NullValueToJSON(object: RichValue_NullValue): string {
  switch (object) {
    case RichValue_NullValue.NULL_VALUE:
      return "NULL_VALUE";
    case RichValue_NullValue.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface RichStruct {
  fields: { [key: string]: RichValue };
}

export interface RichStruct_FieldsEntry {
  key: string;
  value: RichValue | undefined;
}

export interface RichValueList {
  values: RichValue[];
}

export interface RichStructList {
  entities: RichStruct[];
}

export interface BigDecimal {
  value: BigInteger | undefined;
  exp: number;
}

export interface BigInteger {
  negative: boolean;
  data: Uint8Array;
}

export interface TokenAmount {
  token: CoinID | undefined;
  amount: BigDecimal | undefined;
  specifiedAt: Date | undefined;
}

export interface RequestLog {
  requestId: string;
  endpointId: string;
  owner: string;
  slug: string;
  statusCode: number;
  error: string;
  requestBody: Uint8Array;
  requestHeader: { [key: string]: any } | undefined;
  responseBody: Uint8Array;
  responseHeader: { [key: string]: any } | undefined;
  createdAt: Date | undefined;
  duration: bigint;
  queryDuration: bigint;
  method: string;
  rpcNodeId: string;
}

function createBaseUsageTracker(): UsageTracker {
  return {
    apiSku: "",
    webuiSku: "",
    projectIdField: "",
    projectSlugField: "",
    projectOwnerField: "",
    versionField: "",
  };
}

export const UsageTracker = {
  encode(message: UsageTracker, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.apiSku !== "") {
      writer.uint32(10).string(message.apiSku);
    }
    if (message.webuiSku !== "") {
      writer.uint32(18).string(message.webuiSku);
    }
    if (message.projectIdField !== "") {
      writer.uint32(26).string(message.projectIdField);
    }
    if (message.projectSlugField !== "") {
      writer.uint32(34).string(message.projectSlugField);
    }
    if (message.projectOwnerField !== "") {
      writer.uint32(42).string(message.projectOwnerField);
    }
    if (message.versionField !== "") {
      writer.uint32(50).string(message.versionField);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UsageTracker {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUsageTracker();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.apiSku = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.webuiSku = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.projectIdField = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.projectSlugField = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.projectOwnerField = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.versionField = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UsageTracker {
    return {
      apiSku: isSet(object.apiSku) ? globalThis.String(object.apiSku) : "",
      webuiSku: isSet(object.webuiSku) ? globalThis.String(object.webuiSku) : "",
      projectIdField: isSet(object.projectIdField) ? globalThis.String(object.projectIdField) : "",
      projectSlugField: isSet(object.projectSlugField) ? globalThis.String(object.projectSlugField) : "",
      projectOwnerField: isSet(object.projectOwnerField) ? globalThis.String(object.projectOwnerField) : "",
      versionField: isSet(object.versionField) ? globalThis.String(object.versionField) : "",
    };
  },

  toJSON(message: UsageTracker): unknown {
    const obj: any = {};
    if (message.apiSku !== "") {
      obj.apiSku = message.apiSku;
    }
    if (message.webuiSku !== "") {
      obj.webuiSku = message.webuiSku;
    }
    if (message.projectIdField !== "") {
      obj.projectIdField = message.projectIdField;
    }
    if (message.projectSlugField !== "") {
      obj.projectSlugField = message.projectSlugField;
    }
    if (message.projectOwnerField !== "") {
      obj.projectOwnerField = message.projectOwnerField;
    }
    if (message.versionField !== "") {
      obj.versionField = message.versionField;
    }
    return obj;
  },

  create(base?: DeepPartial<UsageTracker>): UsageTracker {
    return UsageTracker.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UsageTracker>): UsageTracker {
    const message = createBaseUsageTracker();
    message.apiSku = object.apiSku ?? "";
    message.webuiSku = object.webuiSku ?? "";
    message.projectIdField = object.projectIdField ?? "";
    message.projectSlugField = object.projectSlugField ?? "";
    message.projectOwnerField = object.projectOwnerField ?? "";
    message.versionField = object.versionField ?? "";
    return message;
  },
};

function createBaseAuthChecker(): AuthChecker {
  return { projectIdField: "", projectSlugField: "", projectOwnerField: "", projectPermission: 0, loaderName: "" };
}

export const AuthChecker = {
  encode(message: AuthChecker, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.projectIdField !== "") {
      writer.uint32(10).string(message.projectIdField);
    }
    if (message.projectSlugField !== "") {
      writer.uint32(18).string(message.projectSlugField);
    }
    if (message.projectOwnerField !== "") {
      writer.uint32(26).string(message.projectOwnerField);
    }
    if (message.projectPermission !== 0) {
      writer.uint32(32).int32(message.projectPermission);
    }
    if (message.loaderName !== "") {
      writer.uint32(42).string(message.loaderName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuthChecker {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuthChecker();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.projectIdField = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.projectSlugField = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.projectOwnerField = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.projectPermission = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.loaderName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AuthChecker {
    return {
      projectIdField: isSet(object.projectIdField) ? globalThis.String(object.projectIdField) : "",
      projectSlugField: isSet(object.projectSlugField) ? globalThis.String(object.projectSlugField) : "",
      projectOwnerField: isSet(object.projectOwnerField) ? globalThis.String(object.projectOwnerField) : "",
      projectPermission: isSet(object.projectPermission) ? authChecker_PermissionFromJSON(object.projectPermission) : 0,
      loaderName: isSet(object.loaderName) ? globalThis.String(object.loaderName) : "",
    };
  },

  toJSON(message: AuthChecker): unknown {
    const obj: any = {};
    if (message.projectIdField !== "") {
      obj.projectIdField = message.projectIdField;
    }
    if (message.projectSlugField !== "") {
      obj.projectSlugField = message.projectSlugField;
    }
    if (message.projectOwnerField !== "") {
      obj.projectOwnerField = message.projectOwnerField;
    }
    if (message.projectPermission !== 0) {
      obj.projectPermission = authChecker_PermissionToJSON(message.projectPermission);
    }
    if (message.loaderName !== "") {
      obj.loaderName = message.loaderName;
    }
    return obj;
  },

  create(base?: DeepPartial<AuthChecker>): AuthChecker {
    return AuthChecker.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AuthChecker>): AuthChecker {
    const message = createBaseAuthChecker();
    message.projectIdField = object.projectIdField ?? "";
    message.projectSlugField = object.projectSlugField ?? "";
    message.projectOwnerField = object.projectOwnerField ?? "";
    message.projectPermission = object.projectPermission ?? 0;
    message.loaderName = object.loaderName ?? "";
    return message;
  },
};

function createBaseAccessMeta(): AccessMeta {
  return {
    projectIdField: "",
    projectSlugField: "",
    ownerIdField: "",
    ownerNameField: "",
    processorIdField: "",
    processorVersionField: "",
  };
}

export const AccessMeta = {
  encode(message: AccessMeta, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.projectIdField !== "") {
      writer.uint32(10).string(message.projectIdField);
    }
    if (message.projectSlugField !== "") {
      writer.uint32(18).string(message.projectSlugField);
    }
    if (message.ownerIdField !== "") {
      writer.uint32(26).string(message.ownerIdField);
    }
    if (message.ownerNameField !== "") {
      writer.uint32(34).string(message.ownerNameField);
    }
    if (message.processorIdField !== "") {
      writer.uint32(42).string(message.processorIdField);
    }
    if (message.processorVersionField !== "") {
      writer.uint32(50).string(message.processorVersionField);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AccessMeta {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccessMeta();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.projectIdField = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.projectSlugField = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.ownerIdField = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.ownerNameField = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.processorIdField = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.processorVersionField = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AccessMeta {
    return {
      projectIdField: isSet(object.projectIdField) ? globalThis.String(object.projectIdField) : "",
      projectSlugField: isSet(object.projectSlugField) ? globalThis.String(object.projectSlugField) : "",
      ownerIdField: isSet(object.ownerIdField) ? globalThis.String(object.ownerIdField) : "",
      ownerNameField: isSet(object.ownerNameField) ? globalThis.String(object.ownerNameField) : "",
      processorIdField: isSet(object.processorIdField) ? globalThis.String(object.processorIdField) : "",
      processorVersionField: isSet(object.processorVersionField) ? globalThis.String(object.processorVersionField) : "",
    };
  },

  toJSON(message: AccessMeta): unknown {
    const obj: any = {};
    if (message.projectIdField !== "") {
      obj.projectIdField = message.projectIdField;
    }
    if (message.projectSlugField !== "") {
      obj.projectSlugField = message.projectSlugField;
    }
    if (message.ownerIdField !== "") {
      obj.ownerIdField = message.ownerIdField;
    }
    if (message.ownerNameField !== "") {
      obj.ownerNameField = message.ownerNameField;
    }
    if (message.processorIdField !== "") {
      obj.processorIdField = message.processorIdField;
    }
    if (message.processorVersionField !== "") {
      obj.processorVersionField = message.processorVersionField;
    }
    return obj;
  },

  create(base?: DeepPartial<AccessMeta>): AccessMeta {
    return AccessMeta.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AccessMeta>): AccessMeta {
    const message = createBaseAccessMeta();
    message.projectIdField = object.projectIdField ?? "";
    message.projectSlugField = object.projectSlugField ?? "";
    message.ownerIdField = object.ownerIdField ?? "";
    message.ownerNameField = object.ownerNameField ?? "";
    message.processorIdField = object.processorIdField ?? "";
    message.processorVersionField = object.processorVersionField ?? "";
    return message;
  },
};

function createBaseUser(): User {
  return {
    id: "",
    email: "",
    emailVerified: false,
    lastName: "",
    firstName: "",
    locale: "",
    nickname: "",
    picture: "",
    sub: "",
    updatedAt: BigInt("0"),
    createdAt: BigInt("0"),
    username: "",
    accountStatus: 0,
    tier: 0,
  };
}

export const User = {
  encode(message: User, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.email !== "") {
      writer.uint32(18).string(message.email);
    }
    if (message.emailVerified !== false) {
      writer.uint32(24).bool(message.emailVerified);
    }
    if (message.lastName !== "") {
      writer.uint32(34).string(message.lastName);
    }
    if (message.firstName !== "") {
      writer.uint32(42).string(message.firstName);
    }
    if (message.locale !== "") {
      writer.uint32(50).string(message.locale);
    }
    if (message.nickname !== "") {
      writer.uint32(66).string(message.nickname);
    }
    if (message.picture !== "") {
      writer.uint32(74).string(message.picture);
    }
    if (message.sub !== "") {
      writer.uint32(82).string(message.sub);
    }
    if (message.updatedAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.updatedAt) !== message.updatedAt) {
        throw new globalThis.Error("value provided for field message.updatedAt of type int64 too large");
      }
      writer.uint32(88).int64(message.updatedAt.toString());
    }
    if (message.createdAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.createdAt) !== message.createdAt) {
        throw new globalThis.Error("value provided for field message.createdAt of type int64 too large");
      }
      writer.uint32(96).int64(message.createdAt.toString());
    }
    if (message.username !== "") {
      writer.uint32(106).string(message.username);
    }
    if (message.accountStatus !== 0) {
      writer.uint32(112).int32(message.accountStatus);
    }
    if (message.tier !== 0) {
      writer.uint32(120).int32(message.tier);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): User {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.email = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.emailVerified = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.lastName = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.firstName = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.locale = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.nickname = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.picture = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.sub = reader.string();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.updatedAt = longToBigint(reader.int64() as Long);
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.createdAt = longToBigint(reader.int64() as Long);
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.username = reader.string();
          continue;
        case 14:
          if (tag !== 112) {
            break;
          }

          message.accountStatus = reader.int32() as any;
          continue;
        case 15:
          if (tag !== 120) {
            break;
          }

          message.tier = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): User {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      email: isSet(object.email) ? globalThis.String(object.email) : "",
      emailVerified: isSet(object.emailVerified) ? globalThis.Boolean(object.emailVerified) : false,
      lastName: isSet(object.lastName) ? globalThis.String(object.lastName) : "",
      firstName: isSet(object.firstName) ? globalThis.String(object.firstName) : "",
      locale: isSet(object.locale) ? globalThis.String(object.locale) : "",
      nickname: isSet(object.nickname) ? globalThis.String(object.nickname) : "",
      picture: isSet(object.picture) ? globalThis.String(object.picture) : "",
      sub: isSet(object.sub) ? globalThis.String(object.sub) : "",
      updatedAt: isSet(object.updatedAt) ? BigInt(object.updatedAt) : BigInt("0"),
      createdAt: isSet(object.createdAt) ? BigInt(object.createdAt) : BigInt("0"),
      username: isSet(object.username) ? globalThis.String(object.username) : "",
      accountStatus: isSet(object.accountStatus) ? user_AccountStatusFromJSON(object.accountStatus) : 0,
      tier: isSet(object.tier) ? tierFromJSON(object.tier) : 0,
    };
  },

  toJSON(message: User): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.email !== "") {
      obj.email = message.email;
    }
    if (message.emailVerified !== false) {
      obj.emailVerified = message.emailVerified;
    }
    if (message.lastName !== "") {
      obj.lastName = message.lastName;
    }
    if (message.firstName !== "") {
      obj.firstName = message.firstName;
    }
    if (message.locale !== "") {
      obj.locale = message.locale;
    }
    if (message.nickname !== "") {
      obj.nickname = message.nickname;
    }
    if (message.picture !== "") {
      obj.picture = message.picture;
    }
    if (message.sub !== "") {
      obj.sub = message.sub;
    }
    if (message.updatedAt !== BigInt("0")) {
      obj.updatedAt = message.updatedAt.toString();
    }
    if (message.createdAt !== BigInt("0")) {
      obj.createdAt = message.createdAt.toString();
    }
    if (message.username !== "") {
      obj.username = message.username;
    }
    if (message.accountStatus !== 0) {
      obj.accountStatus = user_AccountStatusToJSON(message.accountStatus);
    }
    if (message.tier !== 0) {
      obj.tier = tierToJSON(message.tier);
    }
    return obj;
  },

  create(base?: DeepPartial<User>): User {
    return User.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<User>): User {
    const message = createBaseUser();
    message.id = object.id ?? "";
    message.email = object.email ?? "";
    message.emailVerified = object.emailVerified ?? false;
    message.lastName = object.lastName ?? "";
    message.firstName = object.firstName ?? "";
    message.locale = object.locale ?? "";
    message.nickname = object.nickname ?? "";
    message.picture = object.picture ?? "";
    message.sub = object.sub ?? "";
    message.updatedAt = object.updatedAt ?? BigInt("0");
    message.createdAt = object.createdAt ?? BigInt("0");
    message.username = object.username ?? "";
    message.accountStatus = object.accountStatus ?? 0;
    message.tier = object.tier ?? 0;
    return message;
  },
};

function createBaseUserInfo(): UserInfo {
  return { id: "", lastName: "", firstName: "", nickname: "", picture: "", username: "" };
}

export const UserInfo = {
  encode(message: UserInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.lastName !== "") {
      writer.uint32(34).string(message.lastName);
    }
    if (message.firstName !== "") {
      writer.uint32(42).string(message.firstName);
    }
    if (message.nickname !== "") {
      writer.uint32(66).string(message.nickname);
    }
    if (message.picture !== "") {
      writer.uint32(74).string(message.picture);
    }
    if (message.username !== "") {
      writer.uint32(106).string(message.username);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.lastName = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.firstName = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.nickname = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.picture = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.username = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserInfo {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      lastName: isSet(object.lastName) ? globalThis.String(object.lastName) : "",
      firstName: isSet(object.firstName) ? globalThis.String(object.firstName) : "",
      nickname: isSet(object.nickname) ? globalThis.String(object.nickname) : "",
      picture: isSet(object.picture) ? globalThis.String(object.picture) : "",
      username: isSet(object.username) ? globalThis.String(object.username) : "",
    };
  },

  toJSON(message: UserInfo): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.lastName !== "") {
      obj.lastName = message.lastName;
    }
    if (message.firstName !== "") {
      obj.firstName = message.firstName;
    }
    if (message.nickname !== "") {
      obj.nickname = message.nickname;
    }
    if (message.picture !== "") {
      obj.picture = message.picture;
    }
    if (message.username !== "") {
      obj.username = message.username;
    }
    return obj;
  },

  create(base?: DeepPartial<UserInfo>): UserInfo {
    return UserInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UserInfo>): UserInfo {
    const message = createBaseUserInfo();
    message.id = object.id ?? "";
    message.lastName = object.lastName ?? "";
    message.firstName = object.firstName ?? "";
    message.nickname = object.nickname ?? "";
    message.picture = object.picture ?? "";
    message.username = object.username ?? "";
    return message;
  },
};

function createBaseOwner(): Owner {
  return { user: undefined, organization: undefined, tier: 0 };
}

export const Owner = {
  encode(message: Owner, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    if (message.organization !== undefined) {
      Organization.encode(message.organization, writer.uint32(18).fork()).ldelim();
    }
    if (message.tier !== 0) {
      writer.uint32(24).int32(message.tier);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Owner {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOwner();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.organization = Organization.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.tier = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Owner {
    return {
      user: isSet(object.user) ? User.fromJSON(object.user) : undefined,
      organization: isSet(object.organization) ? Organization.fromJSON(object.organization) : undefined,
      tier: isSet(object.tier) ? tierFromJSON(object.tier) : 0,
    };
  },

  toJSON(message: Owner): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = User.toJSON(message.user);
    }
    if (message.organization !== undefined) {
      obj.organization = Organization.toJSON(message.organization);
    }
    if (message.tier !== 0) {
      obj.tier = tierToJSON(message.tier);
    }
    return obj;
  },

  create(base?: DeepPartial<Owner>): Owner {
    return Owner.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Owner>): Owner {
    const message = createBaseOwner();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    message.organization = (object.organization !== undefined && object.organization !== null)
      ? Organization.fromPartial(object.organization)
      : undefined;
    message.tier = object.tier ?? 0;
    return message;
  },
};

function createBaseProject(): Project {
  return {
    id: "",
    displayName: "",
    description: "",
    createdAt: BigInt("0"),
    updatedAt: BigInt("0"),
    slug: "",
    ownerId: "",
    owner: undefined,
    visibility: 0,
    type: 0,
    members: [],
    multiVersion: false,
    ownerName: "",
    notificationChannels: [],
    views: [],
    supersetEnable: false,
    superset: undefined,
    enableDisk: false,
    enableMaterializedView: false,
    defaultTimerange: undefined,
    communityProject: undefined,
  };
}

export const Project = {
  encode(message: Project, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.displayName !== "") {
      writer.uint32(18).string(message.displayName);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.createdAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.createdAt) !== message.createdAt) {
        throw new globalThis.Error("value provided for field message.createdAt of type int64 too large");
      }
      writer.uint32(32).int64(message.createdAt.toString());
    }
    if (message.updatedAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.updatedAt) !== message.updatedAt) {
        throw new globalThis.Error("value provided for field message.updatedAt of type int64 too large");
      }
      writer.uint32(40).int64(message.updatedAt.toString());
    }
    if (message.slug !== "") {
      writer.uint32(50).string(message.slug);
    }
    if (message.ownerId !== "") {
      writer.uint32(58).string(message.ownerId);
    }
    if (message.owner !== undefined) {
      Owner.encode(message.owner, writer.uint32(66).fork()).ldelim();
    }
    if (message.visibility !== 0) {
      writer.uint32(80).int32(message.visibility);
    }
    if (message.type !== 0) {
      writer.uint32(128).int32(message.type);
    }
    for (const v of message.members) {
      Project_ProjectMember.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    if (message.multiVersion !== false) {
      writer.uint32(96).bool(message.multiVersion);
    }
    if (message.ownerName !== "") {
      writer.uint32(106).string(message.ownerName);
    }
    for (const v of message.notificationChannels) {
      Channel.encode(v!, writer.uint32(114).fork()).ldelim();
    }
    for (const v of message.views) {
      ProjectView.encode(v!, writer.uint32(122).fork()).ldelim();
    }
    if (message.supersetEnable !== false) {
      writer.uint32(136).bool(message.supersetEnable);
    }
    if (message.superset !== undefined) {
      ProjectSuperset.encode(message.superset, writer.uint32(146).fork()).ldelim();
    }
    if (message.enableDisk !== false) {
      writer.uint32(152).bool(message.enableDisk);
    }
    if (message.enableMaterializedView !== false) {
      writer.uint32(160).bool(message.enableMaterializedView);
    }
    if (message.defaultTimerange !== undefined) {
      TimeRangeLite.encode(message.defaultTimerange, writer.uint32(170).fork()).ldelim();
    }
    if (message.communityProject !== undefined) {
      CommunityProject.encode(message.communityProject, writer.uint32(178).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Project {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.displayName = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.createdAt = longToBigint(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.updatedAt = longToBigint(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.ownerId = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.owner = Owner.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.visibility = reader.int32() as any;
          continue;
        case 16:
          if (tag !== 128) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.members.push(Project_ProjectMember.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.multiVersion = reader.bool();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.ownerName = reader.string();
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.notificationChannels.push(Channel.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.views.push(ProjectView.decode(reader, reader.uint32()));
          continue;
        case 17:
          if (tag !== 136) {
            break;
          }

          message.supersetEnable = reader.bool();
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.superset = ProjectSuperset.decode(reader, reader.uint32());
          continue;
        case 19:
          if (tag !== 152) {
            break;
          }

          message.enableDisk = reader.bool();
          continue;
        case 20:
          if (tag !== 160) {
            break;
          }

          message.enableMaterializedView = reader.bool();
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.defaultTimerange = TimeRangeLite.decode(reader, reader.uint32());
          continue;
        case 22:
          if (tag !== 178) {
            break;
          }

          message.communityProject = CommunityProject.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Project {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      displayName: isSet(object.displayName) ? globalThis.String(object.displayName) : "",
      description: isSet(object.description) ? globalThis.String(object.description) : "",
      createdAt: isSet(object.createdAt) ? BigInt(object.createdAt) : BigInt("0"),
      updatedAt: isSet(object.updatedAt) ? BigInt(object.updatedAt) : BigInt("0"),
      slug: isSet(object.slug) ? globalThis.String(object.slug) : "",
      ownerId: isSet(object.ownerId) ? globalThis.String(object.ownerId) : "",
      owner: isSet(object.owner) ? Owner.fromJSON(object.owner) : undefined,
      visibility: isSet(object.visibility) ? project_VisibilityFromJSON(object.visibility) : 0,
      type: isSet(object.type) ? project_TypeFromJSON(object.type) : 0,
      members: globalThis.Array.isArray(object?.members)
        ? object.members.map((e: any) => Project_ProjectMember.fromJSON(e))
        : [],
      multiVersion: isSet(object.multiVersion) ? globalThis.Boolean(object.multiVersion) : false,
      ownerName: isSet(object.ownerName) ? globalThis.String(object.ownerName) : "",
      notificationChannels: globalThis.Array.isArray(object?.notificationChannels)
        ? object.notificationChannels.map((e: any) => Channel.fromJSON(e))
        : [],
      views: globalThis.Array.isArray(object?.views) ? object.views.map((e: any) => ProjectView.fromJSON(e)) : [],
      supersetEnable: isSet(object.supersetEnable) ? globalThis.Boolean(object.supersetEnable) : false,
      superset: isSet(object.superset) ? ProjectSuperset.fromJSON(object.superset) : undefined,
      enableDisk: isSet(object.enableDisk) ? globalThis.Boolean(object.enableDisk) : false,
      enableMaterializedView: isSet(object.enableMaterializedView)
        ? globalThis.Boolean(object.enableMaterializedView)
        : false,
      defaultTimerange: isSet(object.defaultTimerange) ? TimeRangeLite.fromJSON(object.defaultTimerange) : undefined,
      communityProject: isSet(object.communityProject) ? CommunityProject.fromJSON(object.communityProject) : undefined,
    };
  },

  toJSON(message: Project): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.displayName !== "") {
      obj.displayName = message.displayName;
    }
    if (message.description !== "") {
      obj.description = message.description;
    }
    if (message.createdAt !== BigInt("0")) {
      obj.createdAt = message.createdAt.toString();
    }
    if (message.updatedAt !== BigInt("0")) {
      obj.updatedAt = message.updatedAt.toString();
    }
    if (message.slug !== "") {
      obj.slug = message.slug;
    }
    if (message.ownerId !== "") {
      obj.ownerId = message.ownerId;
    }
    if (message.owner !== undefined) {
      obj.owner = Owner.toJSON(message.owner);
    }
    if (message.visibility !== 0) {
      obj.visibility = project_VisibilityToJSON(message.visibility);
    }
    if (message.type !== 0) {
      obj.type = project_TypeToJSON(message.type);
    }
    if (message.members?.length) {
      obj.members = message.members.map((e) => Project_ProjectMember.toJSON(e));
    }
    if (message.multiVersion !== false) {
      obj.multiVersion = message.multiVersion;
    }
    if (message.ownerName !== "") {
      obj.ownerName = message.ownerName;
    }
    if (message.notificationChannels?.length) {
      obj.notificationChannels = message.notificationChannels.map((e) => Channel.toJSON(e));
    }
    if (message.views?.length) {
      obj.views = message.views.map((e) => ProjectView.toJSON(e));
    }
    if (message.supersetEnable !== false) {
      obj.supersetEnable = message.supersetEnable;
    }
    if (message.superset !== undefined) {
      obj.superset = ProjectSuperset.toJSON(message.superset);
    }
    if (message.enableDisk !== false) {
      obj.enableDisk = message.enableDisk;
    }
    if (message.enableMaterializedView !== false) {
      obj.enableMaterializedView = message.enableMaterializedView;
    }
    if (message.defaultTimerange !== undefined) {
      obj.defaultTimerange = TimeRangeLite.toJSON(message.defaultTimerange);
    }
    if (message.communityProject !== undefined) {
      obj.communityProject = CommunityProject.toJSON(message.communityProject);
    }
    return obj;
  },

  create(base?: DeepPartial<Project>): Project {
    return Project.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Project>): Project {
    const message = createBaseProject();
    message.id = object.id ?? "";
    message.displayName = object.displayName ?? "";
    message.description = object.description ?? "";
    message.createdAt = object.createdAt ?? BigInt("0");
    message.updatedAt = object.updatedAt ?? BigInt("0");
    message.slug = object.slug ?? "";
    message.ownerId = object.ownerId ?? "";
    message.owner = (object.owner !== undefined && object.owner !== null) ? Owner.fromPartial(object.owner) : undefined;
    message.visibility = object.visibility ?? 0;
    message.type = object.type ?? 0;
    message.members = object.members?.map((e) => Project_ProjectMember.fromPartial(e)) || [];
    message.multiVersion = object.multiVersion ?? false;
    message.ownerName = object.ownerName ?? "";
    message.notificationChannels = object.notificationChannels?.map((e) => Channel.fromPartial(e)) || [];
    message.views = object.views?.map((e) => ProjectView.fromPartial(e)) || [];
    message.supersetEnable = object.supersetEnable ?? false;
    message.superset = (object.superset !== undefined && object.superset !== null)
      ? ProjectSuperset.fromPartial(object.superset)
      : undefined;
    message.enableDisk = object.enableDisk ?? false;
    message.enableMaterializedView = object.enableMaterializedView ?? false;
    message.defaultTimerange = (object.defaultTimerange !== undefined && object.defaultTimerange !== null)
      ? TimeRangeLite.fromPartial(object.defaultTimerange)
      : undefined;
    message.communityProject = (object.communityProject !== undefined && object.communityProject !== null)
      ? CommunityProject.fromPartial(object.communityProject)
      : undefined;
    return message;
  },
};

function createBaseProject_ProjectMember(): Project_ProjectMember {
  return { user: undefined, role: "" };
}

export const Project_ProjectMember = {
  encode(message: Project_ProjectMember, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      UserInfo.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    if (message.role !== "") {
      writer.uint32(18).string(message.role);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Project_ProjectMember {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProject_ProjectMember();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = UserInfo.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.role = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Project_ProjectMember {
    return {
      user: isSet(object.user) ? UserInfo.fromJSON(object.user) : undefined,
      role: isSet(object.role) ? globalThis.String(object.role) : "",
    };
  },

  toJSON(message: Project_ProjectMember): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = UserInfo.toJSON(message.user);
    }
    if (message.role !== "") {
      obj.role = message.role;
    }
    return obj;
  },

  create(base?: DeepPartial<Project_ProjectMember>): Project_ProjectMember {
    return Project_ProjectMember.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Project_ProjectMember>): Project_ProjectMember {
    const message = createBaseProject_ProjectMember();
    message.user = (object.user !== undefined && object.user !== null) ? UserInfo.fromPartial(object.user) : undefined;
    message.role = object.role ?? "";
    return message;
  },
};

function createBaseCommunityProject(): CommunityProject {
  return { dashAlias: "", curated: undefined };
}

export const CommunityProject = {
  encode(message: CommunityProject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.dashAlias !== "") {
      writer.uint32(10).string(message.dashAlias);
    }
    if (message.curated !== undefined) {
      writer.uint32(16).bool(message.curated);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CommunityProject {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommunityProject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.dashAlias = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.curated = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CommunityProject {
    return {
      dashAlias: isSet(object.dashAlias) ? globalThis.String(object.dashAlias) : "",
      curated: isSet(object.curated) ? globalThis.Boolean(object.curated) : undefined,
    };
  },

  toJSON(message: CommunityProject): unknown {
    const obj: any = {};
    if (message.dashAlias !== "") {
      obj.dashAlias = message.dashAlias;
    }
    if (message.curated !== undefined) {
      obj.curated = message.curated;
    }
    return obj;
  },

  create(base?: DeepPartial<CommunityProject>): CommunityProject {
    return CommunityProject.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CommunityProject>): CommunityProject {
    const message = createBaseCommunityProject();
    message.dashAlias = object.dashAlias ?? "";
    message.curated = object.curated ?? undefined;
    return message;
  },
};

function createBaseProjectInfo(): ProjectInfo {
  return {
    id: "",
    displayName: "",
    description: "",
    createdAt: BigInt("0"),
    updatedAt: BigInt("0"),
    slug: "",
    owner: "",
    visibility: 0,
    type: 0,
    multiVersion: false,
    supersetEnable: false,
    superset: undefined,
    enableDisk: false,
    enableMaterializedView: false,
    defaultTimerange: undefined,
  };
}

export const ProjectInfo = {
  encode(message: ProjectInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.displayName !== "") {
      writer.uint32(18).string(message.displayName);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.createdAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.createdAt) !== message.createdAt) {
        throw new globalThis.Error("value provided for field message.createdAt of type int64 too large");
      }
      writer.uint32(32).int64(message.createdAt.toString());
    }
    if (message.updatedAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.updatedAt) !== message.updatedAt) {
        throw new globalThis.Error("value provided for field message.updatedAt of type int64 too large");
      }
      writer.uint32(40).int64(message.updatedAt.toString());
    }
    if (message.slug !== "") {
      writer.uint32(50).string(message.slug);
    }
    if (message.owner !== "") {
      writer.uint32(58).string(message.owner);
    }
    if (message.visibility !== 0) {
      writer.uint32(80).int32(message.visibility);
    }
    if (message.type !== 0) {
      writer.uint32(88).int32(message.type);
    }
    if (message.multiVersion !== false) {
      writer.uint32(96).bool(message.multiVersion);
    }
    if (message.supersetEnable !== false) {
      writer.uint32(104).bool(message.supersetEnable);
    }
    if (message.superset !== undefined) {
      ProjectSuperset.encode(message.superset, writer.uint32(114).fork()).ldelim();
    }
    if (message.enableDisk !== false) {
      writer.uint32(152).bool(message.enableDisk);
    }
    if (message.enableMaterializedView !== false) {
      writer.uint32(160).bool(message.enableMaterializedView);
    }
    if (message.defaultTimerange !== undefined) {
      TimeRangeLite.encode(message.defaultTimerange, writer.uint32(170).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.displayName = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.createdAt = longToBigint(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.updatedAt = longToBigint(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.owner = reader.string();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.visibility = reader.int32() as any;
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.multiVersion = reader.bool();
          continue;
        case 13:
          if (tag !== 104) {
            break;
          }

          message.supersetEnable = reader.bool();
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.superset = ProjectSuperset.decode(reader, reader.uint32());
          continue;
        case 19:
          if (tag !== 152) {
            break;
          }

          message.enableDisk = reader.bool();
          continue;
        case 20:
          if (tag !== 160) {
            break;
          }

          message.enableMaterializedView = reader.bool();
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.defaultTimerange = TimeRangeLite.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProjectInfo {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      displayName: isSet(object.displayName) ? globalThis.String(object.displayName) : "",
      description: isSet(object.description) ? globalThis.String(object.description) : "",
      createdAt: isSet(object.createdAt) ? BigInt(object.createdAt) : BigInt("0"),
      updatedAt: isSet(object.updatedAt) ? BigInt(object.updatedAt) : BigInt("0"),
      slug: isSet(object.slug) ? globalThis.String(object.slug) : "",
      owner: isSet(object.owner) ? globalThis.String(object.owner) : "",
      visibility: isSet(object.visibility) ? project_VisibilityFromJSON(object.visibility) : 0,
      type: isSet(object.type) ? project_TypeFromJSON(object.type) : 0,
      multiVersion: isSet(object.multiVersion) ? globalThis.Boolean(object.multiVersion) : false,
      supersetEnable: isSet(object.supersetEnable) ? globalThis.Boolean(object.supersetEnable) : false,
      superset: isSet(object.superset) ? ProjectSuperset.fromJSON(object.superset) : undefined,
      enableDisk: isSet(object.enableDisk) ? globalThis.Boolean(object.enableDisk) : false,
      enableMaterializedView: isSet(object.enableMaterializedView)
        ? globalThis.Boolean(object.enableMaterializedView)
        : false,
      defaultTimerange: isSet(object.defaultTimerange) ? TimeRangeLite.fromJSON(object.defaultTimerange) : undefined,
    };
  },

  toJSON(message: ProjectInfo): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.displayName !== "") {
      obj.displayName = message.displayName;
    }
    if (message.description !== "") {
      obj.description = message.description;
    }
    if (message.createdAt !== BigInt("0")) {
      obj.createdAt = message.createdAt.toString();
    }
    if (message.updatedAt !== BigInt("0")) {
      obj.updatedAt = message.updatedAt.toString();
    }
    if (message.slug !== "") {
      obj.slug = message.slug;
    }
    if (message.owner !== "") {
      obj.owner = message.owner;
    }
    if (message.visibility !== 0) {
      obj.visibility = project_VisibilityToJSON(message.visibility);
    }
    if (message.type !== 0) {
      obj.type = project_TypeToJSON(message.type);
    }
    if (message.multiVersion !== false) {
      obj.multiVersion = message.multiVersion;
    }
    if (message.supersetEnable !== false) {
      obj.supersetEnable = message.supersetEnable;
    }
    if (message.superset !== undefined) {
      obj.superset = ProjectSuperset.toJSON(message.superset);
    }
    if (message.enableDisk !== false) {
      obj.enableDisk = message.enableDisk;
    }
    if (message.enableMaterializedView !== false) {
      obj.enableMaterializedView = message.enableMaterializedView;
    }
    if (message.defaultTimerange !== undefined) {
      obj.defaultTimerange = TimeRangeLite.toJSON(message.defaultTimerange);
    }
    return obj;
  },

  create(base?: DeepPartial<ProjectInfo>): ProjectInfo {
    return ProjectInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProjectInfo>): ProjectInfo {
    const message = createBaseProjectInfo();
    message.id = object.id ?? "";
    message.displayName = object.displayName ?? "";
    message.description = object.description ?? "";
    message.createdAt = object.createdAt ?? BigInt("0");
    message.updatedAt = object.updatedAt ?? BigInt("0");
    message.slug = object.slug ?? "";
    message.owner = object.owner ?? "";
    message.visibility = object.visibility ?? 0;
    message.type = object.type ?? 0;
    message.multiVersion = object.multiVersion ?? false;
    message.supersetEnable = object.supersetEnable ?? false;
    message.superset = (object.superset !== undefined && object.superset !== null)
      ? ProjectSuperset.fromPartial(object.superset)
      : undefined;
    message.enableDisk = object.enableDisk ?? false;
    message.enableMaterializedView = object.enableMaterializedView ?? false;
    message.defaultTimerange = (object.defaultTimerange !== undefined && object.defaultTimerange !== null)
      ? TimeRangeLite.fromPartial(object.defaultTimerange)
      : undefined;
    return message;
  },
};

function createBaseEventLogColumn(): EventLogColumn {
  return {
    id: "",
    size: 0,
    name: "",
    accessorKey: "",
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
  };
}

export const EventLogColumn = {
  encode(message: EventLogColumn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.size !== 0) {
      writer.uint32(16).int32(message.size);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.accessorKey !== "") {
      writer.uint32(34).string(message.accessorKey);
    }
    if (message.enableHiding !== false) {
      writer.uint32(40).bool(message.enableHiding);
    }
    if (message.enableSorting !== false) {
      writer.uint32(48).bool(message.enableSorting);
    }
    if (message.enableResizing !== false) {
      writer.uint32(56).bool(message.enableResizing);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogColumn {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogColumn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.size = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.accessorKey = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.enableHiding = reader.bool();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.enableSorting = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.enableResizing = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventLogColumn {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      size: isSet(object.size) ? globalThis.Number(object.size) : 0,
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      accessorKey: isSet(object.accessorKey) ? globalThis.String(object.accessorKey) : "",
      enableHiding: isSet(object.enableHiding) ? globalThis.Boolean(object.enableHiding) : false,
      enableSorting: isSet(object.enableSorting) ? globalThis.Boolean(object.enableSorting) : false,
      enableResizing: isSet(object.enableResizing) ? globalThis.Boolean(object.enableResizing) : false,
    };
  },

  toJSON(message: EventLogColumn): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.size !== 0) {
      obj.size = Math.round(message.size);
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.accessorKey !== "") {
      obj.accessorKey = message.accessorKey;
    }
    if (message.enableHiding !== false) {
      obj.enableHiding = message.enableHiding;
    }
    if (message.enableSorting !== false) {
      obj.enableSorting = message.enableSorting;
    }
    if (message.enableResizing !== false) {
      obj.enableResizing = message.enableResizing;
    }
    return obj;
  },

  create(base?: DeepPartial<EventLogColumn>): EventLogColumn {
    return EventLogColumn.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogColumn>): EventLogColumn {
    const message = createBaseEventLogColumn();
    message.id = object.id ?? "";
    message.size = object.size ?? 0;
    message.name = object.name ?? "";
    message.accessorKey = object.accessorKey ?? "";
    message.enableHiding = object.enableHiding ?? false;
    message.enableSorting = object.enableSorting ?? false;
    message.enableResizing = object.enableResizing ?? false;
    return message;
  },
};

function createBaseColumnState(): ColumnState {
  return { columnSizing: {}, columnVisibility: {}, columnOrder: [], sorting: [] };
}

export const ColumnState = {
  encode(message: ColumnState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.columnSizing).forEach(([key, value]) => {
      ColumnState_ColumnSizingEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    Object.entries(message.columnVisibility).forEach(([key, value]) => {
      ColumnState_ColumnVisibilityEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    for (const v of message.columnOrder) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.sorting) {
      ColumnState_Sort.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ColumnState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseColumnState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = ColumnState_ColumnSizingEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.columnSizing[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = ColumnState_ColumnVisibilityEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.columnVisibility[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.columnOrder.push(reader.string());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.sorting.push(ColumnState_Sort.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ColumnState {
    return {
      columnSizing: isObject(object.columnSizing)
        ? Object.entries(object.columnSizing).reduce<{ [key: string]: number }>((acc, [key, value]) => {
          acc[key] = Number(value);
          return acc;
        }, {})
        : {},
      columnVisibility: isObject(object.columnVisibility)
        ? Object.entries(object.columnVisibility).reduce<{ [key: string]: boolean }>((acc, [key, value]) => {
          acc[key] = Boolean(value);
          return acc;
        }, {})
        : {},
      columnOrder: globalThis.Array.isArray(object?.columnOrder)
        ? object.columnOrder.map((e: any) => globalThis.String(e))
        : [],
      sorting: globalThis.Array.isArray(object?.sorting)
        ? object.sorting.map((e: any) => ColumnState_Sort.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ColumnState): unknown {
    const obj: any = {};
    if (message.columnSizing) {
      const entries = Object.entries(message.columnSizing);
      if (entries.length > 0) {
        obj.columnSizing = {};
        entries.forEach(([k, v]) => {
          obj.columnSizing[k] = Math.round(v);
        });
      }
    }
    if (message.columnVisibility) {
      const entries = Object.entries(message.columnVisibility);
      if (entries.length > 0) {
        obj.columnVisibility = {};
        entries.forEach(([k, v]) => {
          obj.columnVisibility[k] = v;
        });
      }
    }
    if (message.columnOrder?.length) {
      obj.columnOrder = message.columnOrder;
    }
    if (message.sorting?.length) {
      obj.sorting = message.sorting.map((e) => ColumnState_Sort.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<ColumnState>): ColumnState {
    return ColumnState.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ColumnState>): ColumnState {
    const message = createBaseColumnState();
    message.columnSizing = Object.entries(object.columnSizing ?? {}).reduce<{ [key: string]: number }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = globalThis.Number(value);
        }
        return acc;
      },
      {},
    );
    message.columnVisibility = Object.entries(object.columnVisibility ?? {}).reduce<{ [key: string]: boolean }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = globalThis.Boolean(value);
        }
        return acc;
      },
      {},
    );
    message.columnOrder = object.columnOrder?.map((e) => e) || [];
    message.sorting = object.sorting?.map((e) => ColumnState_Sort.fromPartial(e)) || [];
    return message;
  },
};

function createBaseColumnState_ColumnSizingEntry(): ColumnState_ColumnSizingEntry {
  return { key: "", value: 0 };
}

export const ColumnState_ColumnSizingEntry = {
  encode(message: ColumnState_ColumnSizingEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).int32(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ColumnState_ColumnSizingEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseColumnState_ColumnSizingEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ColumnState_ColumnSizingEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
    };
  },

  toJSON(message: ColumnState_ColumnSizingEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<ColumnState_ColumnSizingEntry>): ColumnState_ColumnSizingEntry {
    return ColumnState_ColumnSizingEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ColumnState_ColumnSizingEntry>): ColumnState_ColumnSizingEntry {
    const message = createBaseColumnState_ColumnSizingEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseColumnState_ColumnVisibilityEntry(): ColumnState_ColumnVisibilityEntry {
  return { key: "", value: false };
}

export const ColumnState_ColumnVisibilityEntry = {
  encode(message: ColumnState_ColumnVisibilityEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== false) {
      writer.uint32(16).bool(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ColumnState_ColumnVisibilityEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseColumnState_ColumnVisibilityEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ColumnState_ColumnVisibilityEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.Boolean(object.value) : false,
    };
  },

  toJSON(message: ColumnState_ColumnVisibilityEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== false) {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<ColumnState_ColumnVisibilityEntry>): ColumnState_ColumnVisibilityEntry {
    return ColumnState_ColumnVisibilityEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ColumnState_ColumnVisibilityEntry>): ColumnState_ColumnVisibilityEntry {
    const message = createBaseColumnState_ColumnVisibilityEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? false;
    return message;
  },
};

function createBaseColumnState_Sort(): ColumnState_Sort {
  return { id: "", desc: false };
}

export const ColumnState_Sort = {
  encode(message: ColumnState_Sort, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.desc !== false) {
      writer.uint32(16).bool(message.desc);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ColumnState_Sort {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseColumnState_Sort();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.desc = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ColumnState_Sort {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      desc: isSet(object.desc) ? globalThis.Boolean(object.desc) : false,
    };
  },

  toJSON(message: ColumnState_Sort): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.desc !== false) {
      obj.desc = message.desc;
    }
    return obj;
  },

  create(base?: DeepPartial<ColumnState_Sort>): ColumnState_Sort {
    return ColumnState_Sort.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ColumnState_Sort>): ColumnState_Sort {
    const message = createBaseColumnState_Sort();
    message.id = object.id ?? "";
    message.desc = object.desc ?? false;
    return message;
  },
};

function createBaseEventLogConfig(): EventLogConfig {
  return { columns: [], state: undefined };
}

export const EventLogConfig = {
  encode(message: EventLogConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.columns) {
      EventLogColumn.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.state !== undefined) {
      ColumnState.encode(message.state, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.columns.push(EventLogColumn.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.state = ColumnState.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventLogConfig {
    return {
      columns: globalThis.Array.isArray(object?.columns)
        ? object.columns.map((e: any) => EventLogColumn.fromJSON(e))
        : [],
      state: isSet(object.state) ? ColumnState.fromJSON(object.state) : undefined,
    };
  },

  toJSON(message: EventLogConfig): unknown {
    const obj: any = {};
    if (message.columns?.length) {
      obj.columns = message.columns.map((e) => EventLogColumn.toJSON(e));
    }
    if (message.state !== undefined) {
      obj.state = ColumnState.toJSON(message.state);
    }
    return obj;
  },

  create(base?: DeepPartial<EventLogConfig>): EventLogConfig {
    return EventLogConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogConfig>): EventLogConfig {
    const message = createBaseEventLogConfig();
    message.columns = object.columns?.map((e) => EventLogColumn.fromPartial(e)) || [];
    message.state = (object.state !== undefined && object.state !== null)
      ? ColumnState.fromPartial(object.state)
      : undefined;
    return message;
  },
};

function createBaseProjectView(): ProjectView {
  return { id: "", projectId: "", name: "", config: undefined };
}

export const ProjectView = {
  encode(message: ProjectView, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.projectId !== "") {
      writer.uint32(18).string(message.projectId);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.config !== undefined) {
      ProjectView_ProjectViewConfig.encode(message.config, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectView {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectView();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.projectId = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.config = ProjectView_ProjectViewConfig.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProjectView {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      projectId: isSet(object.projectId) ? globalThis.String(object.projectId) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      config: isSet(object.config) ? ProjectView_ProjectViewConfig.fromJSON(object.config) : undefined,
    };
  },

  toJSON(message: ProjectView): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.projectId !== "") {
      obj.projectId = message.projectId;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.config !== undefined) {
      obj.config = ProjectView_ProjectViewConfig.toJSON(message.config);
    }
    return obj;
  },

  create(base?: DeepPartial<ProjectView>): ProjectView {
    return ProjectView.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProjectView>): ProjectView {
    const message = createBaseProjectView();
    message.id = object.id ?? "";
    message.projectId = object.projectId ?? "";
    message.name = object.name ?? "";
    message.config = (object.config !== undefined && object.config !== null)
      ? ProjectView_ProjectViewConfig.fromPartial(object.config)
      : undefined;
    return message;
  },
};

function createBaseProjectView_ProjectViewConfig(): ProjectView_ProjectViewConfig {
  return { eventLog: undefined };
}

export const ProjectView_ProjectViewConfig = {
  encode(message: ProjectView_ProjectViewConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventLog !== undefined) {
      EventLogConfig.encode(message.eventLog, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectView_ProjectViewConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectView_ProjectViewConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.eventLog = EventLogConfig.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProjectView_ProjectViewConfig {
    return { eventLog: isSet(object.eventLog) ? EventLogConfig.fromJSON(object.eventLog) : undefined };
  },

  toJSON(message: ProjectView_ProjectViewConfig): unknown {
    const obj: any = {};
    if (message.eventLog !== undefined) {
      obj.eventLog = EventLogConfig.toJSON(message.eventLog);
    }
    return obj;
  },

  create(base?: DeepPartial<ProjectView_ProjectViewConfig>): ProjectView_ProjectViewConfig {
    return ProjectView_ProjectViewConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProjectView_ProjectViewConfig>): ProjectView_ProjectViewConfig {
    const message = createBaseProjectView_ProjectViewConfig();
    message.eventLog = (object.eventLog !== undefined && object.eventLog !== null)
      ? EventLogConfig.fromPartial(object.eventLog)
      : undefined;
    return message;
  },
};

function createBaseOrganization(): Organization {
  return {
    id: "",
    oid: "",
    name: "",
    createdAt: BigInt("0"),
    updatedAt: BigInt("0"),
    members: [],
    displayName: "",
    logoUrl: "",
    projects: [],
    tier: 0,
  };
}

export const Organization = {
  encode(message: Organization, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.oid !== "") {
      writer.uint32(18).string(message.oid);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.createdAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.createdAt) !== message.createdAt) {
        throw new globalThis.Error("value provided for field message.createdAt of type int64 too large");
      }
      writer.uint32(32).int64(message.createdAt.toString());
    }
    if (message.updatedAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.updatedAt) !== message.updatedAt) {
        throw new globalThis.Error("value provided for field message.updatedAt of type int64 too large");
      }
      writer.uint32(40).int64(message.updatedAt.toString());
    }
    for (const v of message.members) {
      Organization_Member.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.displayName !== "") {
      writer.uint32(58).string(message.displayName);
    }
    if (message.logoUrl !== "") {
      writer.uint32(66).string(message.logoUrl);
    }
    for (const v of message.projects) {
      ProjectInfo.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    if (message.tier !== 0) {
      writer.uint32(80).int32(message.tier);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Organization {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrganization();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.oid = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.createdAt = longToBigint(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.updatedAt = longToBigint(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.members.push(Organization_Member.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.displayName = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.logoUrl = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.projects.push(ProjectInfo.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.tier = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Organization {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      oid: isSet(object.oid) ? globalThis.String(object.oid) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      createdAt: isSet(object.createdAt) ? BigInt(object.createdAt) : BigInt("0"),
      updatedAt: isSet(object.updatedAt) ? BigInt(object.updatedAt) : BigInt("0"),
      members: globalThis.Array.isArray(object?.members)
        ? object.members.map((e: any) => Organization_Member.fromJSON(e))
        : [],
      displayName: isSet(object.displayName) ? globalThis.String(object.displayName) : "",
      logoUrl: isSet(object.logoUrl) ? globalThis.String(object.logoUrl) : "",
      projects: globalThis.Array.isArray(object?.projects)
        ? object.projects.map((e: any) => ProjectInfo.fromJSON(e))
        : [],
      tier: isSet(object.tier) ? tierFromJSON(object.tier) : 0,
    };
  },

  toJSON(message: Organization): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.oid !== "") {
      obj.oid = message.oid;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.createdAt !== BigInt("0")) {
      obj.createdAt = message.createdAt.toString();
    }
    if (message.updatedAt !== BigInt("0")) {
      obj.updatedAt = message.updatedAt.toString();
    }
    if (message.members?.length) {
      obj.members = message.members.map((e) => Organization_Member.toJSON(e));
    }
    if (message.displayName !== "") {
      obj.displayName = message.displayName;
    }
    if (message.logoUrl !== "") {
      obj.logoUrl = message.logoUrl;
    }
    if (message.projects?.length) {
      obj.projects = message.projects.map((e) => ProjectInfo.toJSON(e));
    }
    if (message.tier !== 0) {
      obj.tier = tierToJSON(message.tier);
    }
    return obj;
  },

  create(base?: DeepPartial<Organization>): Organization {
    return Organization.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Organization>): Organization {
    const message = createBaseOrganization();
    message.id = object.id ?? "";
    message.oid = object.oid ?? "";
    message.name = object.name ?? "";
    message.createdAt = object.createdAt ?? BigInt("0");
    message.updatedAt = object.updatedAt ?? BigInt("0");
    message.members = object.members?.map((e) => Organization_Member.fromPartial(e)) || [];
    message.displayName = object.displayName ?? "";
    message.logoUrl = object.logoUrl ?? "";
    message.projects = object.projects?.map((e) => ProjectInfo.fromPartial(e)) || [];
    message.tier = object.tier ?? 0;
    return message;
  },
};

function createBaseOrganization_Member(): Organization_Member {
  return { user: undefined, role: 0 };
}

export const Organization_Member = {
  encode(message: Organization_Member, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      UserInfo.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    if (message.role !== 0) {
      writer.uint32(16).int32(message.role);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Organization_Member {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrganization_Member();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = UserInfo.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.role = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Organization_Member {
    return {
      user: isSet(object.user) ? UserInfo.fromJSON(object.user) : undefined,
      role: isSet(object.role) ? organizationRoleFromJSON(object.role) : 0,
    };
  },

  toJSON(message: Organization_Member): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = UserInfo.toJSON(message.user);
    }
    if (message.role !== 0) {
      obj.role = organizationRoleToJSON(message.role);
    }
    return obj;
  },

  create(base?: DeepPartial<Organization_Member>): Organization_Member {
    return Organization_Member.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Organization_Member>): Organization_Member {
    const message = createBaseOrganization_Member();
    message.user = (object.user !== undefined && object.user !== null) ? UserInfo.fromPartial(object.user) : undefined;
    message.role = object.role ?? 0;
    return message;
  },
};

function createBaseApiKey(): ApiKey {
  return {
    id: "",
    name: "",
    ownerId: "",
    scopes: [],
    createdAt: BigInt("0"),
    updatedAt: BigInt("0"),
    expiresAt: BigInt("0"),
    source: "",
    ownerType: "",
    revealable: false,
    scopeProjects: {},
  };
}

export const ApiKey = {
  encode(message: ApiKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.ownerId !== "") {
      writer.uint32(34).string(message.ownerId);
    }
    for (const v of message.scopes) {
      writer.uint32(42).string(v!);
    }
    if (message.createdAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.createdAt) !== message.createdAt) {
        throw new globalThis.Error("value provided for field message.createdAt of type int64 too large");
      }
      writer.uint32(48).int64(message.createdAt.toString());
    }
    if (message.updatedAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.updatedAt) !== message.updatedAt) {
        throw new globalThis.Error("value provided for field message.updatedAt of type int64 too large");
      }
      writer.uint32(56).int64(message.updatedAt.toString());
    }
    if (message.expiresAt !== BigInt("0")) {
      if (BigInt.asIntN(64, message.expiresAt) !== message.expiresAt) {
        throw new globalThis.Error("value provided for field message.expiresAt of type int64 too large");
      }
      writer.uint32(64).int64(message.expiresAt.toString());
    }
    if (message.source !== "") {
      writer.uint32(74).string(message.source);
    }
    if (message.ownerType !== "") {
      writer.uint32(82).string(message.ownerType);
    }
    if (message.revealable !== false) {
      writer.uint32(88).bool(message.revealable);
    }
    Object.entries(message.scopeProjects).forEach(([key, value]) => {
      ApiKey_ScopeProjectsEntry.encode({ key: key as any, value }, writer.uint32(98).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ApiKey {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseApiKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.ownerId = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.scopes.push(reader.string());
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.createdAt = longToBigint(reader.int64() as Long);
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.updatedAt = longToBigint(reader.int64() as Long);
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.expiresAt = longToBigint(reader.int64() as Long);
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.source = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.ownerType = reader.string();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.revealable = reader.bool();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          const entry12 = ApiKey_ScopeProjectsEntry.decode(reader, reader.uint32());
          if (entry12.value !== undefined) {
            message.scopeProjects[entry12.key] = entry12.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ApiKey {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      ownerId: isSet(object.ownerId) ? globalThis.String(object.ownerId) : "",
      scopes: globalThis.Array.isArray(object?.scopes) ? object.scopes.map((e: any) => globalThis.String(e)) : [],
      createdAt: isSet(object.createdAt) ? BigInt(object.createdAt) : BigInt("0"),
      updatedAt: isSet(object.updatedAt) ? BigInt(object.updatedAt) : BigInt("0"),
      expiresAt: isSet(object.expiresAt) ? BigInt(object.expiresAt) : BigInt("0"),
      source: isSet(object.source) ? globalThis.String(object.source) : "",
      ownerType: isSet(object.ownerType) ? globalThis.String(object.ownerType) : "",
      revealable: isSet(object.revealable) ? globalThis.Boolean(object.revealable) : false,
      scopeProjects: isObject(object.scopeProjects)
        ? Object.entries(object.scopeProjects).reduce<{ [key: string]: ProjectInfo }>((acc, [key, value]) => {
          acc[key] = ProjectInfo.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: ApiKey): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.ownerId !== "") {
      obj.ownerId = message.ownerId;
    }
    if (message.scopes?.length) {
      obj.scopes = message.scopes;
    }
    if (message.createdAt !== BigInt("0")) {
      obj.createdAt = message.createdAt.toString();
    }
    if (message.updatedAt !== BigInt("0")) {
      obj.updatedAt = message.updatedAt.toString();
    }
    if (message.expiresAt !== BigInt("0")) {
      obj.expiresAt = message.expiresAt.toString();
    }
    if (message.source !== "") {
      obj.source = message.source;
    }
    if (message.ownerType !== "") {
      obj.ownerType = message.ownerType;
    }
    if (message.revealable !== false) {
      obj.revealable = message.revealable;
    }
    if (message.scopeProjects) {
      const entries = Object.entries(message.scopeProjects);
      if (entries.length > 0) {
        obj.scopeProjects = {};
        entries.forEach(([k, v]) => {
          obj.scopeProjects[k] = ProjectInfo.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<ApiKey>): ApiKey {
    return ApiKey.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ApiKey>): ApiKey {
    const message = createBaseApiKey();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.ownerId = object.ownerId ?? "";
    message.scopes = object.scopes?.map((e) => e) || [];
    message.createdAt = object.createdAt ?? BigInt("0");
    message.updatedAt = object.updatedAt ?? BigInt("0");
    message.expiresAt = object.expiresAt ?? BigInt("0");
    message.source = object.source ?? "";
    message.ownerType = object.ownerType ?? "";
    message.revealable = object.revealable ?? false;
    message.scopeProjects = Object.entries(object.scopeProjects ?? {}).reduce<{ [key: string]: ProjectInfo }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = ProjectInfo.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseApiKey_ScopeProjectsEntry(): ApiKey_ScopeProjectsEntry {
  return { key: "", value: undefined };
}

export const ApiKey_ScopeProjectsEntry = {
  encode(message: ApiKey_ScopeProjectsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      ProjectInfo.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ApiKey_ScopeProjectsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseApiKey_ScopeProjectsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = ProjectInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ApiKey_ScopeProjectsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? ProjectInfo.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: ApiKey_ScopeProjectsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = ProjectInfo.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<ApiKey_ScopeProjectsEntry>): ApiKey_ScopeProjectsEntry {
    return ApiKey_ScopeProjectsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ApiKey_ScopeProjectsEntry>): ApiKey_ScopeProjectsEntry {
    const message = createBaseApiKey_ScopeProjectsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? ProjectInfo.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseTimeRangeLite(): TimeRangeLite {
  return { start: "", end: "", step: 0, timezone: "" };
}

export const TimeRangeLite = {
  encode(message: TimeRangeLite, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.start !== "") {
      writer.uint32(10).string(message.start);
    }
    if (message.end !== "") {
      writer.uint32(18).string(message.end);
    }
    if (message.step !== 0) {
      writer.uint32(24).int32(message.step);
    }
    if (message.timezone !== "") {
      writer.uint32(34).string(message.timezone);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimeRangeLite {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimeRangeLite();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.start = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.end = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.step = reader.int32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.timezone = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TimeRangeLite {
    return {
      start: isSet(object.start) ? globalThis.String(object.start) : "",
      end: isSet(object.end) ? globalThis.String(object.end) : "",
      step: isSet(object.step) ? globalThis.Number(object.step) : 0,
      timezone: isSet(object.timezone) ? globalThis.String(object.timezone) : "",
    };
  },

  toJSON(message: TimeRangeLite): unknown {
    const obj: any = {};
    if (message.start !== "") {
      obj.start = message.start;
    }
    if (message.end !== "") {
      obj.end = message.end;
    }
    if (message.step !== 0) {
      obj.step = Math.round(message.step);
    }
    if (message.timezone !== "") {
      obj.timezone = message.timezone;
    }
    return obj;
  },

  create(base?: DeepPartial<TimeRangeLite>): TimeRangeLite {
    return TimeRangeLite.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TimeRangeLite>): TimeRangeLite {
    const message = createBaseTimeRangeLite();
    message.start = object.start ?? "";
    message.end = object.end ?? "";
    message.step = object.step ?? 0;
    message.timezone = object.timezone ?? "";
    return message;
  },
};

function createBaseTimeRange(): TimeRange {
  return { start: undefined, end: undefined, step: BigInt("0"), interval: undefined, timezone: "" };
}

export const TimeRange = {
  encode(message: TimeRange, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.start !== undefined) {
      TimeRange_TimeLike.encode(message.start, writer.uint32(10).fork()).ldelim();
    }
    if (message.end !== undefined) {
      TimeRange_TimeLike.encode(message.end, writer.uint32(18).fork()).ldelim();
    }
    if (message.step !== BigInt("0")) {
      if (BigInt.asIntN(64, message.step) !== message.step) {
        throw new globalThis.Error("value provided for field message.step of type int64 too large");
      }
      writer.uint32(24).int64(message.step.toString());
    }
    if (message.interval !== undefined) {
      Duration.encode(message.interval, writer.uint32(34).fork()).ldelim();
    }
    if (message.timezone !== "") {
      writer.uint32(42).string(message.timezone);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimeRange {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimeRange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.start = TimeRange_TimeLike.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.end = TimeRange_TimeLike.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.step = longToBigint(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.interval = Duration.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.timezone = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TimeRange {
    return {
      start: isSet(object.start) ? TimeRange_TimeLike.fromJSON(object.start) : undefined,
      end: isSet(object.end) ? TimeRange_TimeLike.fromJSON(object.end) : undefined,
      step: isSet(object.step) ? BigInt(object.step) : BigInt("0"),
      interval: isSet(object.interval) ? Duration.fromJSON(object.interval) : undefined,
      timezone: isSet(object.timezone) ? globalThis.String(object.timezone) : "",
    };
  },

  toJSON(message: TimeRange): unknown {
    const obj: any = {};
    if (message.start !== undefined) {
      obj.start = TimeRange_TimeLike.toJSON(message.start);
    }
    if (message.end !== undefined) {
      obj.end = TimeRange_TimeLike.toJSON(message.end);
    }
    if (message.step !== BigInt("0")) {
      obj.step = message.step.toString();
    }
    if (message.interval !== undefined) {
      obj.interval = Duration.toJSON(message.interval);
    }
    if (message.timezone !== "") {
      obj.timezone = message.timezone;
    }
    return obj;
  },

  create(base?: DeepPartial<TimeRange>): TimeRange {
    return TimeRange.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TimeRange>): TimeRange {
    const message = createBaseTimeRange();
    message.start = (object.start !== undefined && object.start !== null)
      ? TimeRange_TimeLike.fromPartial(object.start)
      : undefined;
    message.end = (object.end !== undefined && object.end !== null)
      ? TimeRange_TimeLike.fromPartial(object.end)
      : undefined;
    message.step = object.step ?? BigInt("0");
    message.interval = (object.interval !== undefined && object.interval !== null)
      ? Duration.fromPartial(object.interval)
      : undefined;
    message.timezone = object.timezone ?? "";
    return message;
  },
};

function createBaseTimeRange_TimeLike(): TimeRange_TimeLike {
  return { relativeTime: undefined, absoluteTime: undefined };
}

export const TimeRange_TimeLike = {
  encode(message: TimeRange_TimeLike, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.relativeTime !== undefined) {
      TimeRange_RelativeTime.encode(message.relativeTime, writer.uint32(10).fork()).ldelim();
    }
    if (message.absoluteTime !== undefined) {
      if (BigInt.asIntN(64, message.absoluteTime) !== message.absoluteTime) {
        throw new globalThis.Error("value provided for field message.absoluteTime of type int64 too large");
      }
      writer.uint32(16).int64(message.absoluteTime.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimeRange_TimeLike {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimeRange_TimeLike();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.relativeTime = TimeRange_RelativeTime.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.absoluteTime = longToBigint(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TimeRange_TimeLike {
    return {
      relativeTime: isSet(object.relativeTime) ? TimeRange_RelativeTime.fromJSON(object.relativeTime) : undefined,
      absoluteTime: isSet(object.absoluteTime) ? BigInt(object.absoluteTime) : undefined,
    };
  },

  toJSON(message: TimeRange_TimeLike): unknown {
    const obj: any = {};
    if (message.relativeTime !== undefined) {
      obj.relativeTime = TimeRange_RelativeTime.toJSON(message.relativeTime);
    }
    if (message.absoluteTime !== undefined) {
      obj.absoluteTime = message.absoluteTime.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<TimeRange_TimeLike>): TimeRange_TimeLike {
    return TimeRange_TimeLike.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TimeRange_TimeLike>): TimeRange_TimeLike {
    const message = createBaseTimeRange_TimeLike();
    message.relativeTime = (object.relativeTime !== undefined && object.relativeTime !== null)
      ? TimeRange_RelativeTime.fromPartial(object.relativeTime)
      : undefined;
    message.absoluteTime = object.absoluteTime ?? undefined;
    return message;
  },
};

function createBaseTimeRange_RelativeTime(): TimeRange_RelativeTime {
  return { unit: "", value: 0, align: "" };
}

export const TimeRange_RelativeTime = {
  encode(message: TimeRange_RelativeTime, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.unit !== "") {
      writer.uint32(10).string(message.unit);
    }
    if (message.value !== 0) {
      writer.uint32(16).int32(message.value);
    }
    if (message.align !== "") {
      writer.uint32(26).string(message.align);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimeRange_RelativeTime {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimeRange_RelativeTime();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.unit = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.align = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TimeRange_RelativeTime {
    return {
      unit: isSet(object.unit) ? globalThis.String(object.unit) : "",
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
      align: isSet(object.align) ? globalThis.String(object.align) : "",
    };
  },

  toJSON(message: TimeRange_RelativeTime): unknown {
    const obj: any = {};
    if (message.unit !== "") {
      obj.unit = message.unit;
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    if (message.align !== "") {
      obj.align = message.align;
    }
    return obj;
  },

  create(base?: DeepPartial<TimeRange_RelativeTime>): TimeRange_RelativeTime {
    return TimeRange_RelativeTime.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TimeRange_RelativeTime>): TimeRange_RelativeTime {
    const message = createBaseTimeRange_RelativeTime();
    message.unit = object.unit ?? "";
    message.value = object.value ?? 0;
    message.align = object.align ?? "";
    return message;
  },
};

function createBaseDuration(): Duration {
  return { value: 0, unit: "" };
}

export const Duration = {
  encode(message: Duration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value !== 0) {
      writer.uint32(9).double(message.value);
    }
    if (message.unit !== "") {
      writer.uint32(18).string(message.unit);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Duration {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDuration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 9) {
            break;
          }

          message.value = reader.double();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.unit = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Duration {
    return {
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
      unit: isSet(object.unit) ? globalThis.String(object.unit) : "",
    };
  },

  toJSON(message: Duration): unknown {
    const obj: any = {};
    if (message.value !== 0) {
      obj.value = message.value;
    }
    if (message.unit !== "") {
      obj.unit = message.unit;
    }
    return obj;
  },

  create(base?: DeepPartial<Duration>): Duration {
    return Duration.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Duration>): Duration {
    const message = createBaseDuration();
    message.value = object.value ?? 0;
    message.unit = object.unit ?? "";
    return message;
  },
};

function createBaseFormula(): Formula {
  return { expression: "", alias: "", id: "", disabled: false, functions: [], color: "" };
}

export const Formula = {
  encode(message: Formula, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.expression !== "") {
      writer.uint32(10).string(message.expression);
    }
    if (message.alias !== "") {
      writer.uint32(26).string(message.alias);
    }
    if (message.id !== "") {
      writer.uint32(34).string(message.id);
    }
    if (message.disabled !== false) {
      writer.uint32(40).bool(message.disabled);
    }
    for (const v of message.functions) {
      Function.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.color !== "") {
      writer.uint32(58).string(message.color);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Formula {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFormula();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expression = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.alias = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.id = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.disabled = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.functions.push(Function.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.color = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Formula {
    return {
      expression: isSet(object.expression) ? globalThis.String(object.expression) : "",
      alias: isSet(object.alias) ? globalThis.String(object.alias) : "",
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      disabled: isSet(object.disabled) ? globalThis.Boolean(object.disabled) : false,
      functions: globalThis.Array.isArray(object?.functions)
        ? object.functions.map((e: any) => Function.fromJSON(e))
        : [],
      color: isSet(object.color) ? globalThis.String(object.color) : "",
    };
  },

  toJSON(message: Formula): unknown {
    const obj: any = {};
    if (message.expression !== "") {
      obj.expression = message.expression;
    }
    if (message.alias !== "") {
      obj.alias = message.alias;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.disabled !== false) {
      obj.disabled = message.disabled;
    }
    if (message.functions?.length) {
      obj.functions = message.functions.map((e) => Function.toJSON(e));
    }
    if (message.color !== "") {
      obj.color = message.color;
    }
    return obj;
  },

  create(base?: DeepPartial<Formula>): Formula {
    return Formula.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Formula>): Formula {
    const message = createBaseFormula();
    message.expression = object.expression ?? "";
    message.alias = object.alias ?? "";
    message.id = object.id ?? "";
    message.disabled = object.disabled ?? false;
    message.functions = object.functions?.map((e) => Function.fromPartial(e)) || [];
    message.color = object.color ?? "";
    return message;
  },
};

function createBaseArgument(): Argument {
  return {
    stringValue: undefined,
    intValue: undefined,
    doubleValue: undefined,
    boolValue: undefined,
    durationValue: undefined,
  };
}

export const Argument = {
  encode(message: Argument, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stringValue !== undefined) {
      writer.uint32(10).string(message.stringValue);
    }
    if (message.intValue !== undefined) {
      writer.uint32(16).int32(message.intValue);
    }
    if (message.doubleValue !== undefined) {
      writer.uint32(25).double(message.doubleValue);
    }
    if (message.boolValue !== undefined) {
      writer.uint32(32).bool(message.boolValue);
    }
    if (message.durationValue !== undefined) {
      Duration.encode(message.durationValue, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Argument {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArgument();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.stringValue = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.intValue = reader.int32();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.doubleValue = reader.double();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.boolValue = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.durationValue = Duration.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Argument {
    return {
      stringValue: isSet(object.stringValue) ? globalThis.String(object.stringValue) : undefined,
      intValue: isSet(object.intValue) ? globalThis.Number(object.intValue) : undefined,
      doubleValue: isSet(object.doubleValue) ? globalThis.Number(object.doubleValue) : undefined,
      boolValue: isSet(object.boolValue) ? globalThis.Boolean(object.boolValue) : undefined,
      durationValue: isSet(object.durationValue) ? Duration.fromJSON(object.durationValue) : undefined,
    };
  },

  toJSON(message: Argument): unknown {
    const obj: any = {};
    if (message.stringValue !== undefined) {
      obj.stringValue = message.stringValue;
    }
    if (message.intValue !== undefined) {
      obj.intValue = Math.round(message.intValue);
    }
    if (message.doubleValue !== undefined) {
      obj.doubleValue = message.doubleValue;
    }
    if (message.boolValue !== undefined) {
      obj.boolValue = message.boolValue;
    }
    if (message.durationValue !== undefined) {
      obj.durationValue = Duration.toJSON(message.durationValue);
    }
    return obj;
  },

  create(base?: DeepPartial<Argument>): Argument {
    return Argument.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Argument>): Argument {
    const message = createBaseArgument();
    message.stringValue = object.stringValue ?? undefined;
    message.intValue = object.intValue ?? undefined;
    message.doubleValue = object.doubleValue ?? undefined;
    message.boolValue = object.boolValue ?? undefined;
    message.durationValue = (object.durationValue !== undefined && object.durationValue !== null)
      ? Duration.fromPartial(object.durationValue)
      : undefined;
    return message;
  },
};

function createBaseFunction(): Function {
  return { name: "", arguments: [] };
}

export const Function = {
  encode(message: Function, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    for (const v of message.arguments) {
      Argument.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Function {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFunction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.arguments.push(Argument.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Function {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      arguments: globalThis.Array.isArray(object?.arguments)
        ? object.arguments.map((e: any) => Argument.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Function): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.arguments?.length) {
      obj.arguments = message.arguments.map((e) => Argument.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<Function>): Function {
    return Function.fromPartial(base ?? {} as any);
  },
  fromPartial(object: DeepPartial<Function>): Function {
    const message = createBaseFunction();
    message.name = object.name ?? "";
    message.arguments = object.arguments?.map((e) => Argument.fromPartial(e)) || [];
    return message;
  },
};

function createBaseQuery(): Query {
  return {
    query: "",
    alias: "",
    id: "",
    labelSelector: {},
    aggregate: undefined,
    functions: [],
    color: "",
    disabled: false,
  };
}

export const Query = {
  encode(message: Query, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.query !== "") {
      writer.uint32(10).string(message.query);
    }
    if (message.alias !== "") {
      writer.uint32(18).string(message.alias);
    }
    if (message.id !== "") {
      writer.uint32(34).string(message.id);
    }
    Object.entries(message.labelSelector).forEach(([key, value]) => {
      Query_LabelSelectorEntry.encode({ key: key as any, value }, writer.uint32(42).fork()).ldelim();
    });
    if (message.aggregate !== undefined) {
      Aggregate.encode(message.aggregate, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.functions) {
      Function.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.color !== "") {
      writer.uint32(74).string(message.color);
    }
    if (message.disabled !== false) {
      writer.uint32(64).bool(message.disabled);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Query {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.query = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.alias = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.id = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          const entry5 = Query_LabelSelectorEntry.decode(reader, reader.uint32());
          if (entry5.value !== undefined) {
            message.labelSelector[entry5.key] = entry5.value;
          }
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.aggregate = Aggregate.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.functions.push(Function.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.color = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.disabled = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Query {
    return {
      query: isSet(object.query) ? globalThis.String(object.query) : "",
      alias: isSet(object.alias) ? globalThis.String(object.alias) : "",
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      labelSelector: isObject(object.labelSelector)
        ? Object.entries(object.labelSelector).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      aggregate: isSet(object.aggregate) ? Aggregate.fromJSON(object.aggregate) : undefined,
      functions: globalThis.Array.isArray(object?.functions)
        ? object.functions.map((e: any) => Function.fromJSON(e))
        : [],
      color: isSet(object.color) ? globalThis.String(object.color) : "",
      disabled: isSet(object.disabled) ? globalThis.Boolean(object.disabled) : false,
    };
  },

  toJSON(message: Query): unknown {
    const obj: any = {};
    if (message.query !== "") {
      obj.query = message.query;
    }
    if (message.alias !== "") {
      obj.alias = message.alias;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.labelSelector) {
      const entries = Object.entries(message.labelSelector);
      if (entries.length > 0) {
        obj.labelSelector = {};
        entries.forEach(([k, v]) => {
          obj.labelSelector[k] = v;
        });
      }
    }
    if (message.aggregate !== undefined) {
      obj.aggregate = Aggregate.toJSON(message.aggregate);
    }
    if (message.functions?.length) {
      obj.functions = message.functions.map((e) => Function.toJSON(e));
    }
    if (message.color !== "") {
      obj.color = message.color;
    }
    if (message.disabled !== false) {
      obj.disabled = message.disabled;
    }
    return obj;
  },

  create(base?: DeepPartial<Query>): Query {
    return Query.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Query>): Query {
    const message = createBaseQuery();
    message.query = object.query ?? "";
    message.alias = object.alias ?? "";
    message.id = object.id ?? "";
    message.labelSelector = Object.entries(object.labelSelector ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = globalThis.String(value);
        }
        return acc;
      },
      {},
    );
    message.aggregate = (object.aggregate !== undefined && object.aggregate !== null)
      ? Aggregate.fromPartial(object.aggregate)
      : undefined;
    message.functions = object.functions?.map((e) => Function.fromPartial(e)) || [];
    message.color = object.color ?? "";
    message.disabled = object.disabled ?? false;
    return message;
  },
};

function createBaseQuery_LabelSelectorEntry(): Query_LabelSelectorEntry {
  return { key: "", value: "" };
}

export const Query_LabelSelectorEntry = {
  encode(message: Query_LabelSelectorEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Query_LabelSelectorEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuery_LabelSelectorEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Query_LabelSelectorEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: Query_LabelSelectorEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<Query_LabelSelectorEntry>): Query_LabelSelectorEntry {
    return Query_LabelSelectorEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Query_LabelSelectorEntry>): Query_LabelSelectorEntry {
    const message = createBaseQuery_LabelSelectorEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseAggregate(): Aggregate {
  return { op: 0, grouping: [] };
}

export const Aggregate = {
  encode(message: Aggregate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.op !== 0) {
      writer.uint32(8).int32(message.op);
    }
    for (const v of message.grouping) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Aggregate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAggregate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.op = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.grouping.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Aggregate {
    return {
      op: isSet(object.op) ? aggregate_AggregateOpsFromJSON(object.op) : 0,
      grouping: globalThis.Array.isArray(object?.grouping) ? object.grouping.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: Aggregate): unknown {
    const obj: any = {};
    if (message.op !== 0) {
      obj.op = aggregate_AggregateOpsToJSON(message.op);
    }
    if (message.grouping?.length) {
      obj.grouping = message.grouping;
    }
    return obj;
  },

  create(base?: DeepPartial<Aggregate>): Aggregate {
    return Aggregate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Aggregate>): Aggregate {
    const message = createBaseAggregate();
    message.op = object.op ?? 0;
    message.grouping = object.grouping?.map((e) => e) || [];
    return message;
  },
};

function createBaseSelector(): Selector {
  return { key: "", operator: 0, value: [] };
}

export const Selector = {
  encode(message: Selector, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.operator !== 0) {
      writer.uint32(16).int32(message.operator);
    }
    for (const v of message.value) {
      Any.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Selector {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSelector();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.operator = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.value.push(Any.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Selector {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      operator: isSet(object.operator) ? selector_OperatorTypeFromJSON(object.operator) : 0,
      value: globalThis.Array.isArray(object?.value) ? object.value.map((e: any) => Any.fromJSON(e)) : [],
    };
  },

  toJSON(message: Selector): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.operator !== 0) {
      obj.operator = selector_OperatorTypeToJSON(message.operator);
    }
    if (message.value?.length) {
      obj.value = message.value.map((e) => Any.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<Selector>): Selector {
    return Selector.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Selector>): Selector {
    const message = createBaseSelector();
    message.key = object.key ?? "";
    message.operator = object.operator ?? 0;
    message.value = object.value?.map((e) => Any.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSelectorExpr(): SelectorExpr {
  return { selector: undefined, logicExpr: undefined };
}

export const SelectorExpr = {
  encode(message: SelectorExpr, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.selector !== undefined) {
      Selector.encode(message.selector, writer.uint32(10).fork()).ldelim();
    }
    if (message.logicExpr !== undefined) {
      SelectorExpr_LogicExpr.encode(message.logicExpr, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SelectorExpr {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSelectorExpr();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.selector = Selector.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.logicExpr = SelectorExpr_LogicExpr.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SelectorExpr {
    return {
      selector: isSet(object.selector) ? Selector.fromJSON(object.selector) : undefined,
      logicExpr: isSet(object.logicExpr) ? SelectorExpr_LogicExpr.fromJSON(object.logicExpr) : undefined,
    };
  },

  toJSON(message: SelectorExpr): unknown {
    const obj: any = {};
    if (message.selector !== undefined) {
      obj.selector = Selector.toJSON(message.selector);
    }
    if (message.logicExpr !== undefined) {
      obj.logicExpr = SelectorExpr_LogicExpr.toJSON(message.logicExpr);
    }
    return obj;
  },

  create(base?: DeepPartial<SelectorExpr>): SelectorExpr {
    return SelectorExpr.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SelectorExpr>): SelectorExpr {
    const message = createBaseSelectorExpr();
    message.selector = (object.selector !== undefined && object.selector !== null)
      ? Selector.fromPartial(object.selector)
      : undefined;
    message.logicExpr = (object.logicExpr !== undefined && object.logicExpr !== null)
      ? SelectorExpr_LogicExpr.fromPartial(object.logicExpr)
      : undefined;
    return message;
  },
};

function createBaseSelectorExpr_LogicExpr(): SelectorExpr_LogicExpr {
  return { expressions: [], operator: 0 };
}

export const SelectorExpr_LogicExpr = {
  encode(message: SelectorExpr_LogicExpr, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.expressions) {
      SelectorExpr.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.operator !== 0) {
      writer.uint32(16).int32(message.operator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SelectorExpr_LogicExpr {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSelectorExpr_LogicExpr();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expressions.push(SelectorExpr.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.operator = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SelectorExpr_LogicExpr {
    return {
      expressions: globalThis.Array.isArray(object?.expressions)
        ? object.expressions.map((e: any) => SelectorExpr.fromJSON(e))
        : [],
      operator: isSet(object.operator) ? joinOperatorFromJSON(object.operator) : 0,
    };
  },

  toJSON(message: SelectorExpr_LogicExpr): unknown {
    const obj: any = {};
    if (message.expressions?.length) {
      obj.expressions = message.expressions.map((e) => SelectorExpr.toJSON(e));
    }
    if (message.operator !== 0) {
      obj.operator = joinOperatorToJSON(message.operator);
    }
    return obj;
  },

  create(base?: DeepPartial<SelectorExpr_LogicExpr>): SelectorExpr_LogicExpr {
    return SelectorExpr_LogicExpr.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SelectorExpr_LogicExpr>): SelectorExpr_LogicExpr {
    const message = createBaseSelectorExpr_LogicExpr();
    message.expressions = object.expressions?.map((e) => SelectorExpr.fromPartial(e)) || [];
    message.operator = object.operator ?? 0;
    return message;
  },
};

function createBaseCohortsGroup(): CohortsGroup {
  return { joinOperator: 0, filters: [] };
}

export const CohortsGroup = {
  encode(message: CohortsGroup, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.joinOperator !== 0) {
      writer.uint32(8).int32(message.joinOperator);
    }
    for (const v of message.filters) {
      CohortsFilter.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CohortsGroup {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCohortsGroup();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.joinOperator = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.filters.push(CohortsFilter.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CohortsGroup {
    return {
      joinOperator: isSet(object.joinOperator) ? joinOperatorFromJSON(object.joinOperator) : 0,
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => CohortsFilter.fromJSON(e))
        : [],
    };
  },

  toJSON(message: CohortsGroup): unknown {
    const obj: any = {};
    if (message.joinOperator !== 0) {
      obj.joinOperator = joinOperatorToJSON(message.joinOperator);
    }
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => CohortsFilter.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<CohortsGroup>): CohortsGroup {
    return CohortsGroup.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CohortsGroup>): CohortsGroup {
    const message = createBaseCohortsGroup();
    message.joinOperator = object.joinOperator ?? 0;
    message.filters = object.filters?.map((e) => CohortsFilter.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCohortsQuery(): CohortsQuery {
  return { joinOperator: 0, groups: [], name: "", id: "" };
}

export const CohortsQuery = {
  encode(message: CohortsQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.joinOperator !== 0) {
      writer.uint32(8).int32(message.joinOperator);
    }
    for (const v of message.groups) {
      CohortsGroup.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.id !== "") {
      writer.uint32(34).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CohortsQuery {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCohortsQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.joinOperator = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.groups.push(CohortsGroup.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CohortsQuery {
    return {
      joinOperator: isSet(object.joinOperator) ? joinOperatorFromJSON(object.joinOperator) : 0,
      groups: globalThis.Array.isArray(object?.groups) ? object.groups.map((e: any) => CohortsGroup.fromJSON(e)) : [],
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      id: isSet(object.id) ? globalThis.String(object.id) : "",
    };
  },

  toJSON(message: CohortsQuery): unknown {
    const obj: any = {};
    if (message.joinOperator !== 0) {
      obj.joinOperator = joinOperatorToJSON(message.joinOperator);
    }
    if (message.groups?.length) {
      obj.groups = message.groups.map((e) => CohortsGroup.toJSON(e));
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    return obj;
  },

  create(base?: DeepPartial<CohortsQuery>): CohortsQuery {
    return CohortsQuery.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CohortsQuery>): CohortsQuery {
    const message = createBaseCohortsQuery();
    message.joinOperator = object.joinOperator ?? 0;
    message.groups = object.groups?.map((e) => CohortsGroup.fromPartial(e)) || [];
    message.name = object.name ?? "";
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseSegmentationQuery(): SegmentationQuery {
  return {
    resource: undefined,
    alias: "",
    id: "",
    aggregation: undefined,
    selectorExpr: undefined,
    groupBy: [],
    limit: 0,
    functions: [],
    color: "",
    disabled: false,
  };
}

export const SegmentationQuery = {
  encode(message: SegmentationQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.resource !== undefined) {
      SegmentationQuery_Resource.encode(message.resource, writer.uint32(10).fork()).ldelim();
    }
    if (message.alias !== "") {
      writer.uint32(18).string(message.alias);
    }
    if (message.id !== "") {
      writer.uint32(26).string(message.id);
    }
    if (message.aggregation !== undefined) {
      SegmentationQuery_Aggregation.encode(message.aggregation, writer.uint32(34).fork()).ldelim();
    }
    if (message.selectorExpr !== undefined) {
      SegmentationQuery_SelectorExpr.encode(message.selectorExpr, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.groupBy) {
      writer.uint32(50).string(v!);
    }
    if (message.limit !== 0) {
      writer.uint32(64).int32(message.limit);
    }
    for (const v of message.functions) {
      Function.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    if (message.color !== "") {
      writer.uint32(82).string(message.color);
    }
    if (message.disabled !== false) {
      writer.uint32(56).bool(message.disabled);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.resource = SegmentationQuery_Resource.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.alias = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.id = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.aggregation = SegmentationQuery_Aggregation.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.selectorExpr = SegmentationQuery_SelectorExpr.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.groupBy.push(reader.string());
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.limit = reader.int32();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.functions.push(Function.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.color = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.disabled = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentationQuery {
    return {
      resource: isSet(object.resource) ? SegmentationQuery_Resource.fromJSON(object.resource) : undefined,
      alias: isSet(object.alias) ? globalThis.String(object.alias) : "",
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      aggregation: isSet(object.aggregation) ? SegmentationQuery_Aggregation.fromJSON(object.aggregation) : undefined,
      selectorExpr: isSet(object.selectorExpr)
        ? SegmentationQuery_SelectorExpr.fromJSON(object.selectorExpr)
        : undefined,
      groupBy: globalThis.Array.isArray(object?.groupBy) ? object.groupBy.map((e: any) => globalThis.String(e)) : [],
      limit: isSet(object.limit) ? globalThis.Number(object.limit) : 0,
      functions: globalThis.Array.isArray(object?.functions)
        ? object.functions.map((e: any) => Function.fromJSON(e))
        : [],
      color: isSet(object.color) ? globalThis.String(object.color) : "",
      disabled: isSet(object.disabled) ? globalThis.Boolean(object.disabled) : false,
    };
  },

  toJSON(message: SegmentationQuery): unknown {
    const obj: any = {};
    if (message.resource !== undefined) {
      obj.resource = SegmentationQuery_Resource.toJSON(message.resource);
    }
    if (message.alias !== "") {
      obj.alias = message.alias;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.aggregation !== undefined) {
      obj.aggregation = SegmentationQuery_Aggregation.toJSON(message.aggregation);
    }
    if (message.selectorExpr !== undefined) {
      obj.selectorExpr = SegmentationQuery_SelectorExpr.toJSON(message.selectorExpr);
    }
    if (message.groupBy?.length) {
      obj.groupBy = message.groupBy;
    }
    if (message.limit !== 0) {
      obj.limit = Math.round(message.limit);
    }
    if (message.functions?.length) {
      obj.functions = message.functions.map((e) => Function.toJSON(e));
    }
    if (message.color !== "") {
      obj.color = message.color;
    }
    if (message.disabled !== false) {
      obj.disabled = message.disabled;
    }
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery>): SegmentationQuery {
    return SegmentationQuery.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SegmentationQuery>): SegmentationQuery {
    const message = createBaseSegmentationQuery();
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? SegmentationQuery_Resource.fromPartial(object.resource)
      : undefined;
    message.alias = object.alias ?? "";
    message.id = object.id ?? "";
    message.aggregation = (object.aggregation !== undefined && object.aggregation !== null)
      ? SegmentationQuery_Aggregation.fromPartial(object.aggregation)
      : undefined;
    message.selectorExpr = (object.selectorExpr !== undefined && object.selectorExpr !== null)
      ? SegmentationQuery_SelectorExpr.fromPartial(object.selectorExpr)
      : undefined;
    message.groupBy = object.groupBy?.map((e) => e) || [];
    message.limit = object.limit ?? 0;
    message.functions = object.functions?.map((e) => Function.fromPartial(e)) || [];
    message.color = object.color ?? "";
    message.disabled = object.disabled ?? false;
    return message;
  },
};

function createBaseSegmentationQuery_Resource(): SegmentationQuery_Resource {
  return { name: "", type: 0, cohortsId: undefined, cohortsQuery: undefined };
}

export const SegmentationQuery_Resource = {
  encode(message: SegmentationQuery_Resource, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }
    if (message.cohortsId !== undefined) {
      writer.uint32(26).string(message.cohortsId);
    }
    if (message.cohortsQuery !== undefined) {
      CohortsQuery.encode(message.cohortsQuery, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_Resource {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_Resource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.cohortsId = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.cohortsQuery = CohortsQuery.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentationQuery_Resource {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      type: isSet(object.type) ? segmentationQuery_ResourceTypeFromJSON(object.type) : 0,
      cohortsId: isSet(object.cohortsId) ? globalThis.String(object.cohortsId) : undefined,
      cohortsQuery: isSet(object.cohortsQuery) ? CohortsQuery.fromJSON(object.cohortsQuery) : undefined,
    };
  },

  toJSON(message: SegmentationQuery_Resource): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.type !== 0) {
      obj.type = segmentationQuery_ResourceTypeToJSON(message.type);
    }
    if (message.cohortsId !== undefined) {
      obj.cohortsId = message.cohortsId;
    }
    if (message.cohortsQuery !== undefined) {
      obj.cohortsQuery = CohortsQuery.toJSON(message.cohortsQuery);
    }
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery_Resource>): SegmentationQuery_Resource {
    return SegmentationQuery_Resource.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SegmentationQuery_Resource>): SegmentationQuery_Resource {
    const message = createBaseSegmentationQuery_Resource();
    message.name = object.name ?? "";
    message.type = object.type ?? 0;
    message.cohortsId = object.cohortsId ?? undefined;
    message.cohortsQuery = (object.cohortsQuery !== undefined && object.cohortsQuery !== null)
      ? CohortsQuery.fromPartial(object.cohortsQuery)
      : undefined;
    return message;
  },
};

function createBaseSegmentationQuery_Aggregation(): SegmentationQuery_Aggregation {
  return { total: undefined, unique: undefined, countUnique: undefined, aggregateProperties: undefined };
}

export const SegmentationQuery_Aggregation = {
  encode(message: SegmentationQuery_Aggregation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.total !== undefined) {
      SegmentationQuery_Aggregation_Total.encode(message.total, writer.uint32(10).fork()).ldelim();
    }
    if (message.unique !== undefined) {
      SegmentationQuery_Aggregation_Unique.encode(message.unique, writer.uint32(18).fork()).ldelim();
    }
    if (message.countUnique !== undefined) {
      SegmentationQuery_Aggregation_CountUnique.encode(message.countUnique, writer.uint32(26).fork()).ldelim();
    }
    if (message.aggregateProperties !== undefined) {
      SegmentationQuery_Aggregation_AggregateProperties.encode(message.aggregateProperties, writer.uint32(34).fork())
        .ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_Aggregation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_Aggregation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.total = SegmentationQuery_Aggregation_Total.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.unique = SegmentationQuery_Aggregation_Unique.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.countUnique = SegmentationQuery_Aggregation_CountUnique.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.aggregateProperties = SegmentationQuery_Aggregation_AggregateProperties.decode(
            reader,
            reader.uint32(),
          );
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentationQuery_Aggregation {
    return {
      total: isSet(object.total) ? SegmentationQuery_Aggregation_Total.fromJSON(object.total) : undefined,
      unique: isSet(object.unique) ? SegmentationQuery_Aggregation_Unique.fromJSON(object.unique) : undefined,
      countUnique: isSet(object.countUnique)
        ? SegmentationQuery_Aggregation_CountUnique.fromJSON(object.countUnique)
        : undefined,
      aggregateProperties: isSet(object.aggregateProperties)
        ? SegmentationQuery_Aggregation_AggregateProperties.fromJSON(object.aggregateProperties)
        : undefined,
    };
  },

  toJSON(message: SegmentationQuery_Aggregation): unknown {
    const obj: any = {};
    if (message.total !== undefined) {
      obj.total = SegmentationQuery_Aggregation_Total.toJSON(message.total);
    }
    if (message.unique !== undefined) {
      obj.unique = SegmentationQuery_Aggregation_Unique.toJSON(message.unique);
    }
    if (message.countUnique !== undefined) {
      obj.countUnique = SegmentationQuery_Aggregation_CountUnique.toJSON(message.countUnique);
    }
    if (message.aggregateProperties !== undefined) {
      obj.aggregateProperties = SegmentationQuery_Aggregation_AggregateProperties.toJSON(message.aggregateProperties);
    }
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery_Aggregation>): SegmentationQuery_Aggregation {
    return SegmentationQuery_Aggregation.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SegmentationQuery_Aggregation>): SegmentationQuery_Aggregation {
    const message = createBaseSegmentationQuery_Aggregation();
    message.total = (object.total !== undefined && object.total !== null)
      ? SegmentationQuery_Aggregation_Total.fromPartial(object.total)
      : undefined;
    message.unique = (object.unique !== undefined && object.unique !== null)
      ? SegmentationQuery_Aggregation_Unique.fromPartial(object.unique)
      : undefined;
    message.countUnique = (object.countUnique !== undefined && object.countUnique !== null)
      ? SegmentationQuery_Aggregation_CountUnique.fromPartial(object.countUnique)
      : undefined;
    message.aggregateProperties = (object.aggregateProperties !== undefined && object.aggregateProperties !== null)
      ? SegmentationQuery_Aggregation_AggregateProperties.fromPartial(object.aggregateProperties)
      : undefined;
    return message;
  },
};

function createBaseSegmentationQuery_Aggregation_Total(): SegmentationQuery_Aggregation_Total {
  return {};
}

export const SegmentationQuery_Aggregation_Total = {
  encode(_: SegmentationQuery_Aggregation_Total, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_Aggregation_Total {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_Aggregation_Total();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): SegmentationQuery_Aggregation_Total {
    return {};
  },

  toJSON(_: SegmentationQuery_Aggregation_Total): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery_Aggregation_Total>): SegmentationQuery_Aggregation_Total {
    return SegmentationQuery_Aggregation_Total.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<SegmentationQuery_Aggregation_Total>): SegmentationQuery_Aggregation_Total {
    const message = createBaseSegmentationQuery_Aggregation_Total();
    return message;
  },
};

function createBaseSegmentationQuery_Aggregation_Unique(): SegmentationQuery_Aggregation_Unique {
  return {};
}

export const SegmentationQuery_Aggregation_Unique = {
  encode(_: SegmentationQuery_Aggregation_Unique, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_Aggregation_Unique {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_Aggregation_Unique();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): SegmentationQuery_Aggregation_Unique {
    return {};
  },

  toJSON(_: SegmentationQuery_Aggregation_Unique): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery_Aggregation_Unique>): SegmentationQuery_Aggregation_Unique {
    return SegmentationQuery_Aggregation_Unique.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<SegmentationQuery_Aggregation_Unique>): SegmentationQuery_Aggregation_Unique {
    const message = createBaseSegmentationQuery_Aggregation_Unique();
    return message;
  },
};

function createBaseSegmentationQuery_Aggregation_CountUnique(): SegmentationQuery_Aggregation_CountUnique {
  return { duration: undefined };
}

export const SegmentationQuery_Aggregation_CountUnique = {
  encode(message: SegmentationQuery_Aggregation_CountUnique, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.duration !== undefined) {
      Duration.encode(message.duration, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_Aggregation_CountUnique {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_Aggregation_CountUnique();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.duration = Duration.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentationQuery_Aggregation_CountUnique {
    return { duration: isSet(object.duration) ? Duration.fromJSON(object.duration) : undefined };
  },

  toJSON(message: SegmentationQuery_Aggregation_CountUnique): unknown {
    const obj: any = {};
    if (message.duration !== undefined) {
      obj.duration = Duration.toJSON(message.duration);
    }
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery_Aggregation_CountUnique>): SegmentationQuery_Aggregation_CountUnique {
    return SegmentationQuery_Aggregation_CountUnique.fromPartial(base ?? {});
  },
  fromPartial(
    object: DeepPartial<SegmentationQuery_Aggregation_CountUnique>,
  ): SegmentationQuery_Aggregation_CountUnique {
    const message = createBaseSegmentationQuery_Aggregation_CountUnique();
    message.duration = (object.duration !== undefined && object.duration !== null)
      ? Duration.fromPartial(object.duration)
      : undefined;
    return message;
  },
};

function createBaseSegmentationQuery_Aggregation_AggregateProperties(): SegmentationQuery_Aggregation_AggregateProperties {
  return { type: 0, propertyName: "" };
}

export const SegmentationQuery_Aggregation_AggregateProperties = {
  encode(
    message: SegmentationQuery_Aggregation_AggregateProperties,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.propertyName !== "") {
      writer.uint32(18).string(message.propertyName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_Aggregation_AggregateProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_Aggregation_AggregateProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.propertyName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentationQuery_Aggregation_AggregateProperties {
    return {
      type: isSet(object.type)
        ? segmentationQuery_Aggregation_AggregateProperties_AggregationTypeFromJSON(object.type)
        : 0,
      propertyName: isSet(object.propertyName) ? globalThis.String(object.propertyName) : "",
    };
  },

  toJSON(message: SegmentationQuery_Aggregation_AggregateProperties): unknown {
    const obj: any = {};
    if (message.type !== 0) {
      obj.type = segmentationQuery_Aggregation_AggregateProperties_AggregationTypeToJSON(message.type);
    }
    if (message.propertyName !== "") {
      obj.propertyName = message.propertyName;
    }
    return obj;
  },

  create(
    base?: DeepPartial<SegmentationQuery_Aggregation_AggregateProperties>,
  ): SegmentationQuery_Aggregation_AggregateProperties {
    return SegmentationQuery_Aggregation_AggregateProperties.fromPartial(base ?? {});
  },
  fromPartial(
    object: DeepPartial<SegmentationQuery_Aggregation_AggregateProperties>,
  ): SegmentationQuery_Aggregation_AggregateProperties {
    const message = createBaseSegmentationQuery_Aggregation_AggregateProperties();
    message.type = object.type ?? 0;
    message.propertyName = object.propertyName ?? "";
    return message;
  },
};

function createBaseSegmentationQuery_SelectorExpr(): SegmentationQuery_SelectorExpr {
  return { selector: undefined, logicExpr: undefined };
}

export const SegmentationQuery_SelectorExpr = {
  encode(message: SegmentationQuery_SelectorExpr, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.selector !== undefined) {
      Selector.encode(message.selector, writer.uint32(10).fork()).ldelim();
    }
    if (message.logicExpr !== undefined) {
      SegmentationQuery_SelectorExpr_LogicExpr.encode(message.logicExpr, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_SelectorExpr {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_SelectorExpr();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.selector = Selector.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.logicExpr = SegmentationQuery_SelectorExpr_LogicExpr.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentationQuery_SelectorExpr {
    return {
      selector: isSet(object.selector) ? Selector.fromJSON(object.selector) : undefined,
      logicExpr: isSet(object.logicExpr)
        ? SegmentationQuery_SelectorExpr_LogicExpr.fromJSON(object.logicExpr)
        : undefined,
    };
  },

  toJSON(message: SegmentationQuery_SelectorExpr): unknown {
    const obj: any = {};
    if (message.selector !== undefined) {
      obj.selector = Selector.toJSON(message.selector);
    }
    if (message.logicExpr !== undefined) {
      obj.logicExpr = SegmentationQuery_SelectorExpr_LogicExpr.toJSON(message.logicExpr);
    }
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery_SelectorExpr>): SegmentationQuery_SelectorExpr {
    return SegmentationQuery_SelectorExpr.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SegmentationQuery_SelectorExpr>): SegmentationQuery_SelectorExpr {
    const message = createBaseSegmentationQuery_SelectorExpr();
    message.selector = (object.selector !== undefined && object.selector !== null)
      ? Selector.fromPartial(object.selector)
      : undefined;
    message.logicExpr = (object.logicExpr !== undefined && object.logicExpr !== null)
      ? SegmentationQuery_SelectorExpr_LogicExpr.fromPartial(object.logicExpr)
      : undefined;
    return message;
  },
};

function createBaseSegmentationQuery_SelectorExpr_LogicExpr(): SegmentationQuery_SelectorExpr_LogicExpr {
  return { expressions: [], operator: 0 };
}

export const SegmentationQuery_SelectorExpr_LogicExpr = {
  encode(message: SegmentationQuery_SelectorExpr_LogicExpr, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.expressions) {
      SegmentationQuery_SelectorExpr.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.operator !== 0) {
      writer.uint32(16).int32(message.operator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentationQuery_SelectorExpr_LogicExpr {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentationQuery_SelectorExpr_LogicExpr();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expressions.push(SegmentationQuery_SelectorExpr.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.operator = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentationQuery_SelectorExpr_LogicExpr {
    return {
      expressions: globalThis.Array.isArray(object?.expressions)
        ? object.expressions.map((e: any) => SegmentationQuery_SelectorExpr.fromJSON(e))
        : [],
      operator: isSet(object.operator) ? joinOperatorFromJSON(object.operator) : 0,
    };
  },

  toJSON(message: SegmentationQuery_SelectorExpr_LogicExpr): unknown {
    const obj: any = {};
    if (message.expressions?.length) {
      obj.expressions = message.expressions.map((e) => SegmentationQuery_SelectorExpr.toJSON(e));
    }
    if (message.operator !== 0) {
      obj.operator = joinOperatorToJSON(message.operator);
    }
    return obj;
  },

  create(base?: DeepPartial<SegmentationQuery_SelectorExpr_LogicExpr>): SegmentationQuery_SelectorExpr_LogicExpr {
    return SegmentationQuery_SelectorExpr_LogicExpr.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SegmentationQuery_SelectorExpr_LogicExpr>): SegmentationQuery_SelectorExpr_LogicExpr {
    const message = createBaseSegmentationQuery_SelectorExpr_LogicExpr();
    message.expressions = object.expressions?.map((e) => SegmentationQuery_SelectorExpr.fromPartial(e)) || [];
    message.operator = object.operator ?? 0;
    return message;
  },
};

function createBaseCohortsFilter(): CohortsFilter {
  return { symbol: false, name: "", aggregation: undefined, selectorExpr: undefined, timeRange: undefined };
}

export const CohortsFilter = {
  encode(message: CohortsFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.symbol !== false) {
      writer.uint32(8).bool(message.symbol);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.aggregation !== undefined) {
      CohortsFilter_Aggregation.encode(message.aggregation, writer.uint32(26).fork()).ldelim();
    }
    if (message.selectorExpr !== undefined) {
      SelectorExpr.encode(message.selectorExpr, writer.uint32(34).fork()).ldelim();
    }
    if (message.timeRange !== undefined) {
      TimeRangeLite.encode(message.timeRange, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CohortsFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCohortsFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.symbol = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.aggregation = CohortsFilter_Aggregation.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.selectorExpr = SelectorExpr.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.timeRange = TimeRangeLite.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CohortsFilter {
    return {
      symbol: isSet(object.symbol) ? globalThis.Boolean(object.symbol) : false,
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      aggregation: isSet(object.aggregation) ? CohortsFilter_Aggregation.fromJSON(object.aggregation) : undefined,
      selectorExpr: isSet(object.selectorExpr) ? SelectorExpr.fromJSON(object.selectorExpr) : undefined,
      timeRange: isSet(object.timeRange) ? TimeRangeLite.fromJSON(object.timeRange) : undefined,
    };
  },

  toJSON(message: CohortsFilter): unknown {
    const obj: any = {};
    if (message.symbol !== false) {
      obj.symbol = message.symbol;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.aggregation !== undefined) {
      obj.aggregation = CohortsFilter_Aggregation.toJSON(message.aggregation);
    }
    if (message.selectorExpr !== undefined) {
      obj.selectorExpr = SelectorExpr.toJSON(message.selectorExpr);
    }
    if (message.timeRange !== undefined) {
      obj.timeRange = TimeRangeLite.toJSON(message.timeRange);
    }
    return obj;
  },

  create(base?: DeepPartial<CohortsFilter>): CohortsFilter {
    return CohortsFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CohortsFilter>): CohortsFilter {
    const message = createBaseCohortsFilter();
    message.symbol = object.symbol ?? false;
    message.name = object.name ?? "";
    message.aggregation = (object.aggregation !== undefined && object.aggregation !== null)
      ? CohortsFilter_Aggregation.fromPartial(object.aggregation)
      : undefined;
    message.selectorExpr = (object.selectorExpr !== undefined && object.selectorExpr !== null)
      ? SelectorExpr.fromPartial(object.selectorExpr)
      : undefined;
    message.timeRange = (object.timeRange !== undefined && object.timeRange !== null)
      ? TimeRangeLite.fromPartial(object.timeRange)
      : undefined;
    return message;
  },
};

function createBaseCohortsFilter_Aggregation(): CohortsFilter_Aggregation {
  return { total: undefined, aggregateProperties: undefined, operator: 0, value: [] };
}

export const CohortsFilter_Aggregation = {
  encode(message: CohortsFilter_Aggregation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.total !== undefined) {
      CohortsFilter_Aggregation_Total.encode(message.total, writer.uint32(10).fork()).ldelim();
    }
    if (message.aggregateProperties !== undefined) {
      CohortsFilter_Aggregation_AggregateProperties.encode(message.aggregateProperties, writer.uint32(18).fork())
        .ldelim();
    }
    if (message.operator !== 0) {
      writer.uint32(40).int32(message.operator);
    }
    for (const v of message.value) {
      Any.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CohortsFilter_Aggregation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCohortsFilter_Aggregation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.total = CohortsFilter_Aggregation_Total.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.aggregateProperties = CohortsFilter_Aggregation_AggregateProperties.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.operator = reader.int32() as any;
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.value.push(Any.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CohortsFilter_Aggregation {
    return {
      total: isSet(object.total) ? CohortsFilter_Aggregation_Total.fromJSON(object.total) : undefined,
      aggregateProperties: isSet(object.aggregateProperties)
        ? CohortsFilter_Aggregation_AggregateProperties.fromJSON(object.aggregateProperties)
        : undefined,
      operator: isSet(object.operator) ? cohortsFilter_Aggregation_OperatorTypeFromJSON(object.operator) : 0,
      value: globalThis.Array.isArray(object?.value) ? object.value.map((e: any) => Any.fromJSON(e)) : [],
    };
  },

  toJSON(message: CohortsFilter_Aggregation): unknown {
    const obj: any = {};
    if (message.total !== undefined) {
      obj.total = CohortsFilter_Aggregation_Total.toJSON(message.total);
    }
    if (message.aggregateProperties !== undefined) {
      obj.aggregateProperties = CohortsFilter_Aggregation_AggregateProperties.toJSON(message.aggregateProperties);
    }
    if (message.operator !== 0) {
      obj.operator = cohortsFilter_Aggregation_OperatorTypeToJSON(message.operator);
    }
    if (message.value?.length) {
      obj.value = message.value.map((e) => Any.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<CohortsFilter_Aggregation>): CohortsFilter_Aggregation {
    return CohortsFilter_Aggregation.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CohortsFilter_Aggregation>): CohortsFilter_Aggregation {
    const message = createBaseCohortsFilter_Aggregation();
    message.total = (object.total !== undefined && object.total !== null)
      ? CohortsFilter_Aggregation_Total.fromPartial(object.total)
      : undefined;
    message.aggregateProperties = (object.aggregateProperties !== undefined && object.aggregateProperties !== null)
      ? CohortsFilter_Aggregation_AggregateProperties.fromPartial(object.aggregateProperties)
      : undefined;
    message.operator = object.operator ?? 0;
    message.value = object.value?.map((e) => Any.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCohortsFilter_Aggregation_Total(): CohortsFilter_Aggregation_Total {
  return {};
}

export const CohortsFilter_Aggregation_Total = {
  encode(_: CohortsFilter_Aggregation_Total, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CohortsFilter_Aggregation_Total {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCohortsFilter_Aggregation_Total();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): CohortsFilter_Aggregation_Total {
    return {};
  },

  toJSON(_: CohortsFilter_Aggregation_Total): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<CohortsFilter_Aggregation_Total>): CohortsFilter_Aggregation_Total {
    return CohortsFilter_Aggregation_Total.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<CohortsFilter_Aggregation_Total>): CohortsFilter_Aggregation_Total {
    const message = createBaseCohortsFilter_Aggregation_Total();
    return message;
  },
};

function createBaseCohortsFilter_Aggregation_AggregateProperties(): CohortsFilter_Aggregation_AggregateProperties {
  return { type: 0, propertyName: "" };
}

export const CohortsFilter_Aggregation_AggregateProperties = {
  encode(message: CohortsFilter_Aggregation_AggregateProperties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.propertyName !== "") {
      writer.uint32(18).string(message.propertyName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CohortsFilter_Aggregation_AggregateProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCohortsFilter_Aggregation_AggregateProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.propertyName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CohortsFilter_Aggregation_AggregateProperties {
    return {
      type: isSet(object.type) ? cohortsFilter_Aggregation_AggregateProperties_AggregationTypeFromJSON(object.type) : 0,
      propertyName: isSet(object.propertyName) ? globalThis.String(object.propertyName) : "",
    };
  },

  toJSON(message: CohortsFilter_Aggregation_AggregateProperties): unknown {
    const obj: any = {};
    if (message.type !== 0) {
      obj.type = cohortsFilter_Aggregation_AggregateProperties_AggregationTypeToJSON(message.type);
    }
    if (message.propertyName !== "") {
      obj.propertyName = message.propertyName;
    }
    return obj;
  },

  create(
    base?: DeepPartial<CohortsFilter_Aggregation_AggregateProperties>,
  ): CohortsFilter_Aggregation_AggregateProperties {
    return CohortsFilter_Aggregation_AggregateProperties.fromPartial(base ?? {});
  },
  fromPartial(
    object: DeepPartial<CohortsFilter_Aggregation_AggregateProperties>,
  ): CohortsFilter_Aggregation_AggregateProperties {
    const message = createBaseCohortsFilter_Aggregation_AggregateProperties();
    message.type = object.type ?? 0;
    message.propertyName = object.propertyName ?? "";
    return message;
  },
};

function createBaseContract(): Contract {
  return { address: "", name: "", chainId: "", id: "", source: 0 };
}

export const Contract = {
  encode(message: Contract, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.chainId !== "") {
      writer.uint32(26).string(message.chainId);
    }
    if (message.id !== "") {
      writer.uint32(42).string(message.id);
    }
    if (message.source !== 0) {
      writer.uint32(48).int32(message.source);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Contract {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContract();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.address = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.chainId = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.id = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.source = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Contract {
    return {
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      source: isSet(object.source) ? contract_SourceFromJSON(object.source) : 0,
    };
  },

  toJSON(message: Contract): unknown {
    const obj: any = {};
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.chainId !== "") {
      obj.chainId = message.chainId;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.source !== 0) {
      obj.source = contract_SourceToJSON(message.source);
    }
    return obj;
  },

  create(base?: DeepPartial<Contract>): Contract {
    return Contract.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Contract>): Contract {
    const message = createBaseContract();
    message.address = object.address ?? "";
    message.name = object.name ?? "";
    message.chainId = object.chainId ?? "";
    message.id = object.id ?? "";
    message.source = object.source ?? 0;
    return message;
  },
};

function createBaseErrorRecord(): ErrorRecord {
  return { id: "", namespace: 0, code: 0, namespaceCode: 0, message: "", createdAt: undefined };
}

export const ErrorRecord = {
  encode(message: ErrorRecord, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.namespace !== 0) {
      writer.uint32(16).int32(message.namespace);
    }
    if (message.code !== 0) {
      writer.uint32(24).int32(message.code);
    }
    if (message.namespaceCode !== 0) {
      writer.uint32(32).int32(message.namespaceCode);
    }
    if (message.message !== "") {
      writer.uint32(42).string(message.message);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ErrorRecord {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseErrorRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.namespace = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.code = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.namespaceCode = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.message = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ErrorRecord {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      namespace: isSet(object.namespace) ? globalThis.Number(object.namespace) : 0,
      code: isSet(object.code) ? globalThis.Number(object.code) : 0,
      namespaceCode: isSet(object.namespaceCode) ? globalThis.Number(object.namespaceCode) : 0,
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
    };
  },

  toJSON(message: ErrorRecord): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.namespace !== 0) {
      obj.namespace = Math.round(message.namespace);
    }
    if (message.code !== 0) {
      obj.code = Math.round(message.code);
    }
    if (message.namespaceCode !== 0) {
      obj.namespaceCode = Math.round(message.namespaceCode);
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<ErrorRecord>): ErrorRecord {
    return ErrorRecord.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ErrorRecord>): ErrorRecord {
    const message = createBaseErrorRecord();
    message.id = object.id ?? "";
    message.namespace = object.namespace ?? 0;
    message.code = object.code ?? 0;
    message.namespaceCode = object.namespaceCode ?? 0;
    message.message = object.message ?? "";
    message.createdAt = object.createdAt ?? undefined;
    return message;
  },
};

function createBaseStringList(): StringList {
  return { values: [] };
}

export const StringList = {
  encode(message: StringList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StringList {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStringList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StringList {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: StringList): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<StringList>): StringList {
    return StringList.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StringList>): StringList {
    const message = createBaseStringList();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseAny(): Any {
  return {
    intValue: undefined,
    longValue: undefined,
    doubleValue: undefined,
    stringValue: undefined,
    boolValue: undefined,
    dateValue: undefined,
    listValue: undefined,
  };
}

export const Any = {
  encode(message: Any, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.intValue !== undefined) {
      writer.uint32(8).int32(message.intValue);
    }
    if (message.longValue !== undefined) {
      if (BigInt.asIntN(64, message.longValue) !== message.longValue) {
        throw new globalThis.Error("value provided for field message.longValue of type int64 too large");
      }
      writer.uint32(16).int64(message.longValue.toString());
    }
    if (message.doubleValue !== undefined) {
      writer.uint32(25).double(message.doubleValue);
    }
    if (message.stringValue !== undefined) {
      writer.uint32(34).string(message.stringValue);
    }
    if (message.boolValue !== undefined) {
      writer.uint32(40).bool(message.boolValue);
    }
    if (message.dateValue !== undefined) {
      Timestamp.encode(toTimestamp(message.dateValue), writer.uint32(50).fork()).ldelim();
    }
    if (message.listValue !== undefined) {
      StringList.encode(message.listValue, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Any {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAny();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.intValue = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.longValue = longToBigint(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.doubleValue = reader.double();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.stringValue = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.boolValue = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.dateValue = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.listValue = StringList.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Any {
    return {
      intValue: isSet(object.intValue) ? globalThis.Number(object.intValue) : undefined,
      longValue: isSet(object.longValue) ? BigInt(object.longValue) : undefined,
      doubleValue: isSet(object.doubleValue) ? globalThis.Number(object.doubleValue) : undefined,
      stringValue: isSet(object.stringValue) ? globalThis.String(object.stringValue) : undefined,
      boolValue: isSet(object.boolValue) ? globalThis.Boolean(object.boolValue) : undefined,
      dateValue: isSet(object.dateValue) ? fromJsonTimestamp(object.dateValue) : undefined,
      listValue: isSet(object.listValue) ? StringList.fromJSON(object.listValue) : undefined,
    };
  },

  toJSON(message: Any): unknown {
    const obj: any = {};
    if (message.intValue !== undefined) {
      obj.intValue = Math.round(message.intValue);
    }
    if (message.longValue !== undefined) {
      obj.longValue = message.longValue.toString();
    }
    if (message.doubleValue !== undefined) {
      obj.doubleValue = message.doubleValue;
    }
    if (message.stringValue !== undefined) {
      obj.stringValue = message.stringValue;
    }
    if (message.boolValue !== undefined) {
      obj.boolValue = message.boolValue;
    }
    if (message.dateValue !== undefined) {
      obj.dateValue = message.dateValue.toISOString();
    }
    if (message.listValue !== undefined) {
      obj.listValue = StringList.toJSON(message.listValue);
    }
    return obj;
  },

  create(base?: DeepPartial<Any>): Any {
    return Any.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Any>): Any {
    const message = createBaseAny();
    message.intValue = object.intValue ?? undefined;
    message.longValue = object.longValue ?? undefined;
    message.doubleValue = object.doubleValue ?? undefined;
    message.stringValue = object.stringValue ?? undefined;
    message.boolValue = object.boolValue ?? undefined;
    message.dateValue = object.dateValue ?? undefined;
    message.listValue = (object.listValue !== undefined && object.listValue !== null)
      ? StringList.fromPartial(object.listValue)
      : undefined;
    return message;
  },
};

function createBaseChannel(): Channel {
  return {
    id: "",
    projectId: "",
    type: 0,
    slackWebhookUrl: "",
    emailAddress: "",
    name: "",
    customWebhookUrl: "",
    customHeaders: {},
    telegramReference: "",
    telegramChatId: "",
    slackTeam: "",
    slackChannel: "",
    pagerdutyConfig: undefined,
  };
}

export const Channel = {
  encode(message: Channel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.projectId !== "") {
      writer.uint32(18).string(message.projectId);
    }
    if (message.type !== 0) {
      writer.uint32(24).int32(message.type);
    }
    if (message.slackWebhookUrl !== "") {
      writer.uint32(34).string(message.slackWebhookUrl);
    }
    if (message.emailAddress !== "") {
      writer.uint32(42).string(message.emailAddress);
    }
    if (message.name !== "") {
      writer.uint32(50).string(message.name);
    }
    if (message.customWebhookUrl !== "") {
      writer.uint32(58).string(message.customWebhookUrl);
    }
    Object.entries(message.customHeaders).forEach(([key, value]) => {
      Channel_CustomHeadersEntry.encode({ key: key as any, value }, writer.uint32(66).fork()).ldelim();
    });
    if (message.telegramReference !== "") {
      writer.uint32(74).string(message.telegramReference);
    }
    if (message.telegramChatId !== "") {
      writer.uint32(82).string(message.telegramChatId);
    }
    if (message.slackTeam !== "") {
      writer.uint32(90).string(message.slackTeam);
    }
    if (message.slackChannel !== "") {
      writer.uint32(98).string(message.slackChannel);
    }
    if (message.pagerdutyConfig !== undefined) {
      Struct.encode(Struct.wrap(message.pagerdutyConfig), writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Channel {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChannel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.projectId = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slackWebhookUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.emailAddress = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.name = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.customWebhookUrl = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          const entry8 = Channel_CustomHeadersEntry.decode(reader, reader.uint32());
          if (entry8.value !== undefined) {
            message.customHeaders[entry8.key] = entry8.value;
          }
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.telegramReference = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.telegramChatId = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.slackTeam = reader.string();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.slackChannel = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.pagerdutyConfig = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Channel {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      projectId: isSet(object.projectId) ? globalThis.String(object.projectId) : "",
      type: isSet(object.type) ? channel_TypeFromJSON(object.type) : 0,
      slackWebhookUrl: isSet(object.slackWebhookUrl) ? globalThis.String(object.slackWebhookUrl) : "",
      emailAddress: isSet(object.emailAddress) ? globalThis.String(object.emailAddress) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      customWebhookUrl: isSet(object.customWebhookUrl) ? globalThis.String(object.customWebhookUrl) : "",
      customHeaders: isObject(object.customHeaders)
        ? Object.entries(object.customHeaders).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      telegramReference: isSet(object.telegramReference) ? globalThis.String(object.telegramReference) : "",
      telegramChatId: isSet(object.telegramChatId) ? globalThis.String(object.telegramChatId) : "",
      slackTeam: isSet(object.slackTeam) ? globalThis.String(object.slackTeam) : "",
      slackChannel: isSet(object.slackChannel) ? globalThis.String(object.slackChannel) : "",
      pagerdutyConfig: isObject(object.pagerdutyConfig) ? object.pagerdutyConfig : undefined,
    };
  },

  toJSON(message: Channel): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.projectId !== "") {
      obj.projectId = message.projectId;
    }
    if (message.type !== 0) {
      obj.type = channel_TypeToJSON(message.type);
    }
    if (message.slackWebhookUrl !== "") {
      obj.slackWebhookUrl = message.slackWebhookUrl;
    }
    if (message.emailAddress !== "") {
      obj.emailAddress = message.emailAddress;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.customWebhookUrl !== "") {
      obj.customWebhookUrl = message.customWebhookUrl;
    }
    if (message.customHeaders) {
      const entries = Object.entries(message.customHeaders);
      if (entries.length > 0) {
        obj.customHeaders = {};
        entries.forEach(([k, v]) => {
          obj.customHeaders[k] = v;
        });
      }
    }
    if (message.telegramReference !== "") {
      obj.telegramReference = message.telegramReference;
    }
    if (message.telegramChatId !== "") {
      obj.telegramChatId = message.telegramChatId;
    }
    if (message.slackTeam !== "") {
      obj.slackTeam = message.slackTeam;
    }
    if (message.slackChannel !== "") {
      obj.slackChannel = message.slackChannel;
    }
    if (message.pagerdutyConfig !== undefined) {
      obj.pagerdutyConfig = message.pagerdutyConfig;
    }
    return obj;
  },

  create(base?: DeepPartial<Channel>): Channel {
    return Channel.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Channel>): Channel {
    const message = createBaseChannel();
    message.id = object.id ?? "";
    message.projectId = object.projectId ?? "";
    message.type = object.type ?? 0;
    message.slackWebhookUrl = object.slackWebhookUrl ?? "";
    message.emailAddress = object.emailAddress ?? "";
    message.name = object.name ?? "";
    message.customWebhookUrl = object.customWebhookUrl ?? "";
    message.customHeaders = Object.entries(object.customHeaders ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = globalThis.String(value);
        }
        return acc;
      },
      {},
    );
    message.telegramReference = object.telegramReference ?? "";
    message.telegramChatId = object.telegramChatId ?? "";
    message.slackTeam = object.slackTeam ?? "";
    message.slackChannel = object.slackChannel ?? "";
    message.pagerdutyConfig = object.pagerdutyConfig ?? undefined;
    return message;
  },
};

function createBaseChannel_CustomHeadersEntry(): Channel_CustomHeadersEntry {
  return { key: "", value: "" };
}

export const Channel_CustomHeadersEntry = {
  encode(message: Channel_CustomHeadersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Channel_CustomHeadersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChannel_CustomHeadersEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Channel_CustomHeadersEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: Channel_CustomHeadersEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<Channel_CustomHeadersEntry>): Channel_CustomHeadersEntry {
    return Channel_CustomHeadersEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Channel_CustomHeadersEntry>): Channel_CustomHeadersEntry {
    const message = createBaseChannel_CustomHeadersEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseEventLogEntry(): EventLogEntry {
  return {
    message: "",
    timestamp: BigInt("0"),
    logLevel: "",
    logType: "",
    contractName: "",
    contractAddress: "",
    blockNumber: BigInt("0"),
    chainId: "",
    attributes: undefined,
    id: "",
    transactionHash: "",
    highlightedMessage: "",
    distinctId: "",
    eventName: "",
    logIndex: 0,
    transactionIndex: 0,
  };
}

export const EventLogEntry = {
  encode(message: EventLogEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.timestamp !== BigInt("0")) {
      if (BigInt.asIntN(64, message.timestamp) !== message.timestamp) {
        throw new globalThis.Error("value provided for field message.timestamp of type int64 too large");
      }
      writer.uint32(16).int64(message.timestamp.toString());
    }
    if (message.logLevel !== "") {
      writer.uint32(26).string(message.logLevel);
    }
    if (message.logType !== "") {
      writer.uint32(34).string(message.logType);
    }
    if (message.contractName !== "") {
      writer.uint32(42).string(message.contractName);
    }
    if (message.contractAddress !== "") {
      writer.uint32(50).string(message.contractAddress);
    }
    if (message.blockNumber !== BigInt("0")) {
      if (BigInt.asUintN(64, message.blockNumber) !== message.blockNumber) {
        throw new globalThis.Error("value provided for field message.blockNumber of type uint64 too large");
      }
      writer.uint32(56).uint64(message.blockNumber.toString());
    }
    if (message.chainId !== "") {
      writer.uint32(66).string(message.chainId);
    }
    if (message.attributes !== undefined) {
      Struct.encode(Struct.wrap(message.attributes), writer.uint32(74).fork()).ldelim();
    }
    if (message.id !== "") {
      writer.uint32(82).string(message.id);
    }
    if (message.transactionHash !== "") {
      writer.uint32(90).string(message.transactionHash);
    }
    if (message.highlightedMessage !== "") {
      writer.uint32(98).string(message.highlightedMessage);
    }
    if (message.distinctId !== "") {
      writer.uint32(106).string(message.distinctId);
    }
    if (message.eventName !== "") {
      writer.uint32(114).string(message.eventName);
    }
    if (message.logIndex !== 0) {
      writer.uint32(120).int32(message.logIndex);
    }
    if (message.transactionIndex !== 0) {
      writer.uint32(128).int32(message.transactionIndex);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.timestamp = longToBigint(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.logLevel = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.logType = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.contractName = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.contractAddress = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.blockNumber = longToBigint(reader.uint64() as Long);
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.chainId = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.attributes = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.id = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.transactionHash = reader.string();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.highlightedMessage = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.distinctId = reader.string();
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.eventName = reader.string();
          continue;
        case 15:
          if (tag !== 120) {
            break;
          }

          message.logIndex = reader.int32();
          continue;
        case 16:
          if (tag !== 128) {
            break;
          }

          message.transactionIndex = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventLogEntry {
    return {
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      timestamp: isSet(object.timestamp) ? BigInt(object.timestamp) : BigInt("0"),
      logLevel: isSet(object.logLevel) ? globalThis.String(object.logLevel) : "",
      logType: isSet(object.logType) ? globalThis.String(object.logType) : "",
      contractName: isSet(object.contractName) ? globalThis.String(object.contractName) : "",
      contractAddress: isSet(object.contractAddress) ? globalThis.String(object.contractAddress) : "",
      blockNumber: isSet(object.blockNumber) ? BigInt(object.blockNumber) : BigInt("0"),
      chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
      attributes: isObject(object.attributes) ? object.attributes : undefined,
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      transactionHash: isSet(object.transactionHash) ? globalThis.String(object.transactionHash) : "",
      highlightedMessage: isSet(object.highlightedMessage) ? globalThis.String(object.highlightedMessage) : "",
      distinctId: isSet(object.distinctId) ? globalThis.String(object.distinctId) : "",
      eventName: isSet(object.eventName) ? globalThis.String(object.eventName) : "",
      logIndex: isSet(object.logIndex) ? globalThis.Number(object.logIndex) : 0,
      transactionIndex: isSet(object.transactionIndex) ? globalThis.Number(object.transactionIndex) : 0,
    };
  },

  toJSON(message: EventLogEntry): unknown {
    const obj: any = {};
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.timestamp !== BigInt("0")) {
      obj.timestamp = message.timestamp.toString();
    }
    if (message.logLevel !== "") {
      obj.logLevel = message.logLevel;
    }
    if (message.logType !== "") {
      obj.logType = message.logType;
    }
    if (message.contractName !== "") {
      obj.contractName = message.contractName;
    }
    if (message.contractAddress !== "") {
      obj.contractAddress = message.contractAddress;
    }
    if (message.blockNumber !== BigInt("0")) {
      obj.blockNumber = message.blockNumber.toString();
    }
    if (message.chainId !== "") {
      obj.chainId = message.chainId;
    }
    if (message.attributes !== undefined) {
      obj.attributes = message.attributes;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.transactionHash !== "") {
      obj.transactionHash = message.transactionHash;
    }
    if (message.highlightedMessage !== "") {
      obj.highlightedMessage = message.highlightedMessage;
    }
    if (message.distinctId !== "") {
      obj.distinctId = message.distinctId;
    }
    if (message.eventName !== "") {
      obj.eventName = message.eventName;
    }
    if (message.logIndex !== 0) {
      obj.logIndex = Math.round(message.logIndex);
    }
    if (message.transactionIndex !== 0) {
      obj.transactionIndex = Math.round(message.transactionIndex);
    }
    return obj;
  },

  create(base?: DeepPartial<EventLogEntry>): EventLogEntry {
    return EventLogEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogEntry>): EventLogEntry {
    const message = createBaseEventLogEntry();
    message.message = object.message ?? "";
    message.timestamp = object.timestamp ?? BigInt("0");
    message.logLevel = object.logLevel ?? "";
    message.logType = object.logType ?? "";
    message.contractName = object.contractName ?? "";
    message.contractAddress = object.contractAddress ?? "";
    message.blockNumber = object.blockNumber ?? BigInt("0");
    message.chainId = object.chainId ?? "";
    message.attributes = object.attributes ?? undefined;
    message.id = object.id ?? "";
    message.transactionHash = object.transactionHash ?? "";
    message.highlightedMessage = object.highlightedMessage ?? "";
    message.distinctId = object.distinctId ?? "";
    message.eventName = object.eventName ?? "";
    message.logIndex = object.logIndex ?? 0;
    message.transactionIndex = object.transactionIndex ?? 0;
    return message;
  },
};

function createBaseMatrix(): Matrix {
  return { samples: [], totalSamples: 0 };
}

export const Matrix = {
  encode(message: Matrix, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.samples) {
      Matrix_Sample.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.totalSamples !== 0) {
      writer.uint32(16).int32(message.totalSamples);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Matrix {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatrix();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.samples.push(Matrix_Sample.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.totalSamples = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Matrix {
    return {
      samples: globalThis.Array.isArray(object?.samples)
        ? object.samples.map((e: any) => Matrix_Sample.fromJSON(e))
        : [],
      totalSamples: isSet(object.totalSamples) ? globalThis.Number(object.totalSamples) : 0,
    };
  },

  toJSON(message: Matrix): unknown {
    const obj: any = {};
    if (message.samples?.length) {
      obj.samples = message.samples.map((e) => Matrix_Sample.toJSON(e));
    }
    if (message.totalSamples !== 0) {
      obj.totalSamples = Math.round(message.totalSamples);
    }
    return obj;
  },

  create(base?: DeepPartial<Matrix>): Matrix {
    return Matrix.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Matrix>): Matrix {
    const message = createBaseMatrix();
    message.samples = object.samples?.map((e) => Matrix_Sample.fromPartial(e)) || [];
    message.totalSamples = object.totalSamples ?? 0;
    return message;
  },
};

function createBaseMatrix_Sample(): Matrix_Sample {
  return { metric: undefined, values: [] };
}

export const Matrix_Sample = {
  encode(message: Matrix_Sample, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.metric !== undefined) {
      Matrix_Metric.encode(message.metric, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.values) {
      Matrix_Value.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Matrix_Sample {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatrix_Sample();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metric = Matrix_Metric.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.values.push(Matrix_Value.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Matrix_Sample {
    return {
      metric: isSet(object.metric) ? Matrix_Metric.fromJSON(object.metric) : undefined,
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => Matrix_Value.fromJSON(e)) : [],
    };
  },

  toJSON(message: Matrix_Sample): unknown {
    const obj: any = {};
    if (message.metric !== undefined) {
      obj.metric = Matrix_Metric.toJSON(message.metric);
    }
    if (message.values?.length) {
      obj.values = message.values.map((e) => Matrix_Value.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<Matrix_Sample>): Matrix_Sample {
    return Matrix_Sample.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Matrix_Sample>): Matrix_Sample {
    const message = createBaseMatrix_Sample();
    message.metric = (object.metric !== undefined && object.metric !== null)
      ? Matrix_Metric.fromPartial(object.metric)
      : undefined;
    message.values = object.values?.map((e) => Matrix_Value.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMatrix_Metric(): Matrix_Metric {
  return { name: "", labels: {}, displayName: "" };
}

export const Matrix_Metric = {
  encode(message: Matrix_Metric, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    Object.entries(message.labels).forEach(([key, value]) => {
      Matrix_Metric_LabelsEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    if (message.displayName !== "") {
      writer.uint32(34).string(message.displayName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Matrix_Metric {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatrix_Metric();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = Matrix_Metric_LabelsEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.labels[entry2.key] = entry2.value;
          }
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.displayName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Matrix_Metric {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      labels: isObject(object.labels)
        ? Object.entries(object.labels).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      displayName: isSet(object.displayName) ? globalThis.String(object.displayName) : "",
    };
  },

  toJSON(message: Matrix_Metric): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.labels) {
      const entries = Object.entries(message.labels);
      if (entries.length > 0) {
        obj.labels = {};
        entries.forEach(([k, v]) => {
          obj.labels[k] = v;
        });
      }
    }
    if (message.displayName !== "") {
      obj.displayName = message.displayName;
    }
    return obj;
  },

  create(base?: DeepPartial<Matrix_Metric>): Matrix_Metric {
    return Matrix_Metric.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Matrix_Metric>): Matrix_Metric {
    const message = createBaseMatrix_Metric();
    message.name = object.name ?? "";
    message.labels = Object.entries(object.labels ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.displayName = object.displayName ?? "";
    return message;
  },
};

function createBaseMatrix_Metric_LabelsEntry(): Matrix_Metric_LabelsEntry {
  return { key: "", value: "" };
}

export const Matrix_Metric_LabelsEntry = {
  encode(message: Matrix_Metric_LabelsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Matrix_Metric_LabelsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatrix_Metric_LabelsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Matrix_Metric_LabelsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: Matrix_Metric_LabelsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<Matrix_Metric_LabelsEntry>): Matrix_Metric_LabelsEntry {
    return Matrix_Metric_LabelsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Matrix_Metric_LabelsEntry>): Matrix_Metric_LabelsEntry {
    const message = createBaseMatrix_Metric_LabelsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseMatrix_Value(): Matrix_Value {
  return { timestamp: BigInt("0"), value: 0 };
}

export const Matrix_Value = {
  encode(message: Matrix_Value, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timestamp !== BigInt("0")) {
      if (BigInt.asIntN(64, message.timestamp) !== message.timestamp) {
        throw new globalThis.Error("value provided for field message.timestamp of type int64 too large");
      }
      writer.uint32(8).int64(message.timestamp.toString());
    }
    if (message.value !== 0) {
      writer.uint32(17).double(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Matrix_Value {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatrix_Value();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.timestamp = longToBigint(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.value = reader.double();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Matrix_Value {
    return {
      timestamp: isSet(object.timestamp) ? BigInt(object.timestamp) : BigInt("0"),
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
    };
  },

  toJSON(message: Matrix_Value): unknown {
    const obj: any = {};
    if (message.timestamp !== BigInt("0")) {
      obj.timestamp = message.timestamp.toString();
    }
    if (message.value !== 0) {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<Matrix_Value>): Matrix_Value {
    return Matrix_Value.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Matrix_Value>): Matrix_Value {
    const message = createBaseMatrix_Value();
    message.timestamp = object.timestamp ?? BigInt("0");
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseDashboardSharingRequest(): DashboardSharingRequest {
  return {
    sharingId: "",
    panelId: "",
    samplesLimit: 0,
    timeRange: undefined,
    version: 0,
    variables: undefined,
    samplesOffset: 0,
  };
}

export const DashboardSharingRequest = {
  encode(message: DashboardSharingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sharingId !== "") {
      writer.uint32(10).string(message.sharingId);
    }
    if (message.panelId !== "") {
      writer.uint32(18).string(message.panelId);
    }
    if (message.samplesLimit !== 0) {
      writer.uint32(40).int32(message.samplesLimit);
    }
    if (message.timeRange !== undefined) {
      TimeRangeLite.encode(message.timeRange, writer.uint32(50).fork()).ldelim();
    }
    if (message.version !== 0) {
      writer.uint32(56).int32(message.version);
    }
    if (message.variables !== undefined) {
      Struct.encode(Struct.wrap(message.variables), writer.uint32(66).fork()).ldelim();
    }
    if (message.samplesOffset !== 0) {
      writer.uint32(72).int32(message.samplesOffset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DashboardSharingRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDashboardSharingRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.sharingId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.panelId = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.samplesLimit = reader.int32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.timeRange = TimeRangeLite.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.version = reader.int32();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.variables = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.samplesOffset = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DashboardSharingRequest {
    return {
      sharingId: isSet(object.sharingId) ? globalThis.String(object.sharingId) : "",
      panelId: isSet(object.panelId) ? globalThis.String(object.panelId) : "",
      samplesLimit: isSet(object.samplesLimit) ? globalThis.Number(object.samplesLimit) : 0,
      timeRange: isSet(object.timeRange) ? TimeRangeLite.fromJSON(object.timeRange) : undefined,
      version: isSet(object.version) ? globalThis.Number(object.version) : 0,
      variables: isObject(object.variables) ? object.variables : undefined,
      samplesOffset: isSet(object.samplesOffset) ? globalThis.Number(object.samplesOffset) : 0,
    };
  },

  toJSON(message: DashboardSharingRequest): unknown {
    const obj: any = {};
    if (message.sharingId !== "") {
      obj.sharingId = message.sharingId;
    }
    if (message.panelId !== "") {
      obj.panelId = message.panelId;
    }
    if (message.samplesLimit !== 0) {
      obj.samplesLimit = Math.round(message.samplesLimit);
    }
    if (message.timeRange !== undefined) {
      obj.timeRange = TimeRangeLite.toJSON(message.timeRange);
    }
    if (message.version !== 0) {
      obj.version = Math.round(message.version);
    }
    if (message.variables !== undefined) {
      obj.variables = message.variables;
    }
    if (message.samplesOffset !== 0) {
      obj.samplesOffset = Math.round(message.samplesOffset);
    }
    return obj;
  },

  create(base?: DeepPartial<DashboardSharingRequest>): DashboardSharingRequest {
    return DashboardSharingRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DashboardSharingRequest>): DashboardSharingRequest {
    const message = createBaseDashboardSharingRequest();
    message.sharingId = object.sharingId ?? "";
    message.panelId = object.panelId ?? "";
    message.samplesLimit = object.samplesLimit ?? 0;
    message.timeRange = (object.timeRange !== undefined && object.timeRange !== null)
      ? TimeRangeLite.fromPartial(object.timeRange)
      : undefined;
    message.version = object.version ?? 0;
    message.variables = object.variables ?? undefined;
    message.samplesOffset = object.samplesOffset ?? 0;
    return message;
  },
};

function createBaseUserUsage(): UserUsage {
  return { tier: 0, projects: 0, alerts: 0, usageByProjects: {} };
}

export const UserUsage = {
  encode(message: UserUsage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tier !== 0) {
      writer.uint32(8).int32(message.tier);
    }
    if (message.projects !== 0) {
      writer.uint32(16).int32(message.projects);
    }
    if (message.alerts !== 0) {
      writer.uint32(24).int32(message.alerts);
    }
    Object.entries(message.usageByProjects).forEach(([key, value]) => {
      UserUsage_UsageByProjectsEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserUsage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserUsage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.tier = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.projects = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.alerts = reader.int32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = UserUsage_UsageByProjectsEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.usageByProjects[entry4.key] = entry4.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserUsage {
    return {
      tier: isSet(object.tier) ? tierFromJSON(object.tier) : 0,
      projects: isSet(object.projects) ? globalThis.Number(object.projects) : 0,
      alerts: isSet(object.alerts) ? globalThis.Number(object.alerts) : 0,
      usageByProjects: isObject(object.usageByProjects)
        ? Object.entries(object.usageByProjects).reduce<{ [key: string]: UserUsage_ProjectUsage }>(
          (acc, [key, value]) => {
            acc[key] = UserUsage_ProjectUsage.fromJSON(value);
            return acc;
          },
          {},
        )
        : {},
    };
  },

  toJSON(message: UserUsage): unknown {
    const obj: any = {};
    if (message.tier !== 0) {
      obj.tier = tierToJSON(message.tier);
    }
    if (message.projects !== 0) {
      obj.projects = Math.round(message.projects);
    }
    if (message.alerts !== 0) {
      obj.alerts = Math.round(message.alerts);
    }
    if (message.usageByProjects) {
      const entries = Object.entries(message.usageByProjects);
      if (entries.length > 0) {
        obj.usageByProjects = {};
        entries.forEach(([k, v]) => {
          obj.usageByProjects[k] = UserUsage_ProjectUsage.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<UserUsage>): UserUsage {
    return UserUsage.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UserUsage>): UserUsage {
    const message = createBaseUserUsage();
    message.tier = object.tier ?? 0;
    message.projects = object.projects ?? 0;
    message.alerts = object.alerts ?? 0;
    message.usageByProjects = Object.entries(object.usageByProjects ?? {}).reduce<
      { [key: string]: UserUsage_ProjectUsage }
    >((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = UserUsage_ProjectUsage.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseUserUsage_ProjectUsage(): UserUsage_ProjectUsage {
  return { owner: "", slug: "", cost: BigInt("0") };
}

export const UserUsage_ProjectUsage = {
  encode(message: UserUsage_ProjectUsage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.slug !== "") {
      writer.uint32(18).string(message.slug);
    }
    if (message.cost !== BigInt("0")) {
      if (BigInt.asUintN(64, message.cost) !== message.cost) {
        throw new globalThis.Error("value provided for field message.cost of type uint64 too large");
      }
      writer.uint32(24).uint64(message.cost.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserUsage_ProjectUsage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserUsage_ProjectUsage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.owner = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.cost = longToBigint(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserUsage_ProjectUsage {
    return {
      owner: isSet(object.owner) ? globalThis.String(object.owner) : "",
      slug: isSet(object.slug) ? globalThis.String(object.slug) : "",
      cost: isSet(object.cost) ? BigInt(object.cost) : BigInt("0"),
    };
  },

  toJSON(message: UserUsage_ProjectUsage): unknown {
    const obj: any = {};
    if (message.owner !== "") {
      obj.owner = message.owner;
    }
    if (message.slug !== "") {
      obj.slug = message.slug;
    }
    if (message.cost !== BigInt("0")) {
      obj.cost = message.cost.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<UserUsage_ProjectUsage>): UserUsage_ProjectUsage {
    return UserUsage_ProjectUsage.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UserUsage_ProjectUsage>): UserUsage_ProjectUsage {
    const message = createBaseUserUsage_ProjectUsage();
    message.owner = object.owner ?? "";
    message.slug = object.slug ?? "";
    message.cost = object.cost ?? BigInt("0");
    return message;
  },
};

function createBaseUserUsage_UsageByProjectsEntry(): UserUsage_UsageByProjectsEntry {
  return { key: "", value: undefined };
}

export const UserUsage_UsageByProjectsEntry = {
  encode(message: UserUsage_UsageByProjectsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      UserUsage_ProjectUsage.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserUsage_UsageByProjectsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserUsage_UsageByProjectsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = UserUsage_ProjectUsage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserUsage_UsageByProjectsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? UserUsage_ProjectUsage.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: UserUsage_UsageByProjectsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = UserUsage_ProjectUsage.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<UserUsage_UsageByProjectsEntry>): UserUsage_UsageByProjectsEntry {
    return UserUsage_UsageByProjectsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UserUsage_UsageByProjectsEntry>): UserUsage_UsageByProjectsEntry {
    const message = createBaseUserUsage_UsageByProjectsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? UserUsage_ProjectUsage.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseCoinID(): CoinID {
  return { symbol: undefined, address: undefined };
}

export const CoinID = {
  encode(message: CoinID, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.symbol !== undefined) {
      writer.uint32(10).string(message.symbol);
    }
    if (message.address !== undefined) {
      CoinID_AddressIdentifier.encode(message.address, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CoinID {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoinID();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.symbol = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.address = CoinID_AddressIdentifier.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CoinID {
    return {
      symbol: isSet(object.symbol) ? globalThis.String(object.symbol) : undefined,
      address: isSet(object.address) ? CoinID_AddressIdentifier.fromJSON(object.address) : undefined,
    };
  },

  toJSON(message: CoinID): unknown {
    const obj: any = {};
    if (message.symbol !== undefined) {
      obj.symbol = message.symbol;
    }
    if (message.address !== undefined) {
      obj.address = CoinID_AddressIdentifier.toJSON(message.address);
    }
    return obj;
  },

  create(base?: DeepPartial<CoinID>): CoinID {
    return CoinID.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CoinID>): CoinID {
    const message = createBaseCoinID();
    message.symbol = object.symbol ?? undefined;
    message.address = (object.address !== undefined && object.address !== null)
      ? CoinID_AddressIdentifier.fromPartial(object.address)
      : undefined;
    return message;
  },
};

function createBaseCoinID_AddressIdentifier(): CoinID_AddressIdentifier {
  return { address: "", chain: "" };
}

export const CoinID_AddressIdentifier = {
  encode(message: CoinID_AddressIdentifier, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.chain !== "") {
      writer.uint32(18).string(message.chain);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CoinID_AddressIdentifier {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoinID_AddressIdentifier();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.address = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.chain = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CoinID_AddressIdentifier {
    return {
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      chain: isSet(object.chain) ? globalThis.String(object.chain) : "",
    };
  },

  toJSON(message: CoinID_AddressIdentifier): unknown {
    const obj: any = {};
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.chain !== "") {
      obj.chain = message.chain;
    }
    return obj;
  },

  create(base?: DeepPartial<CoinID_AddressIdentifier>): CoinID_AddressIdentifier {
    return CoinID_AddressIdentifier.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CoinID_AddressIdentifier>): CoinID_AddressIdentifier {
    const message = createBaseCoinID_AddressIdentifier();
    message.address = object.address ?? "";
    message.chain = object.chain ?? "";
    return message;
  },
};

function createBasePriceSegmentationQuery(): PriceSegmentationQuery {
  return { id: "", alias: "", coinId: [], color: "", disabled: false };
}

export const PriceSegmentationQuery = {
  encode(message: PriceSegmentationQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.alias !== "") {
      writer.uint32(18).string(message.alias);
    }
    for (const v of message.coinId) {
      CoinID.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.color !== "") {
      writer.uint32(34).string(message.color);
    }
    if (message.disabled !== false) {
      writer.uint32(72).bool(message.disabled);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PriceSegmentationQuery {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceSegmentationQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.alias = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.coinId.push(CoinID.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.color = reader.string();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.disabled = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PriceSegmentationQuery {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      alias: isSet(object.alias) ? globalThis.String(object.alias) : "",
      coinId: globalThis.Array.isArray(object?.coinId) ? object.coinId.map((e: any) => CoinID.fromJSON(e)) : [],
      color: isSet(object.color) ? globalThis.String(object.color) : "",
      disabled: isSet(object.disabled) ? globalThis.Boolean(object.disabled) : false,
    };
  },

  toJSON(message: PriceSegmentationQuery): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.alias !== "") {
      obj.alias = message.alias;
    }
    if (message.coinId?.length) {
      obj.coinId = message.coinId.map((e) => CoinID.toJSON(e));
    }
    if (message.color !== "") {
      obj.color = message.color;
    }
    if (message.disabled !== false) {
      obj.disabled = message.disabled;
    }
    return obj;
  },

  create(base?: DeepPartial<PriceSegmentationQuery>): PriceSegmentationQuery {
    return PriceSegmentationQuery.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PriceSegmentationQuery>): PriceSegmentationQuery {
    const message = createBasePriceSegmentationQuery();
    message.id = object.id ?? "";
    message.alias = object.alias ?? "";
    message.coinId = object.coinId?.map((e) => CoinID.fromPartial(e)) || [];
    message.color = object.color ?? "";
    message.disabled = object.disabled ?? false;
    return message;
  },
};

function createBaseTabularData(): TabularData {
  return { columns: [], columnTypes: {}, rows: [], generatedAt: undefined, cursor: "" };
}

export const TabularData = {
  encode(message: TabularData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.columns) {
      writer.uint32(10).string(v!);
    }
    Object.entries(message.columnTypes).forEach(([key, value]) => {
      TabularData_ColumnTypesEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    for (const v of message.rows) {
      Struct.encode(Struct.wrap(v!), writer.uint32(26).fork()).ldelim();
    }
    if (message.generatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.generatedAt), writer.uint32(34).fork()).ldelim();
    }
    if (message.cursor !== "") {
      writer.uint32(42).string(message.cursor);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TabularData {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTabularData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.columns.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = TabularData_ColumnTypesEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.columnTypes[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.rows.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.generatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.cursor = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TabularData {
    return {
      columns: globalThis.Array.isArray(object?.columns) ? object.columns.map((e: any) => globalThis.String(e)) : [],
      columnTypes: isObject(object.columnTypes)
        ? Object.entries(object.columnTypes).reduce<{ [key: string]: TabularData_ColumnType }>((acc, [key, value]) => {
          acc[key] = tabularData_ColumnTypeFromJSON(value);
          return acc;
        }, {})
        : {},
      rows: globalThis.Array.isArray(object?.rows) ? [...object.rows] : [],
      generatedAt: isSet(object.generatedAt) ? fromJsonTimestamp(object.generatedAt) : undefined,
      cursor: isSet(object.cursor) ? globalThis.String(object.cursor) : "",
    };
  },

  toJSON(message: TabularData): unknown {
    const obj: any = {};
    if (message.columns?.length) {
      obj.columns = message.columns;
    }
    if (message.columnTypes) {
      const entries = Object.entries(message.columnTypes);
      if (entries.length > 0) {
        obj.columnTypes = {};
        entries.forEach(([k, v]) => {
          obj.columnTypes[k] = tabularData_ColumnTypeToJSON(v);
        });
      }
    }
    if (message.rows?.length) {
      obj.rows = message.rows;
    }
    if (message.generatedAt !== undefined) {
      obj.generatedAt = message.generatedAt.toISOString();
    }
    if (message.cursor !== "") {
      obj.cursor = message.cursor;
    }
    return obj;
  },

  create(base?: DeepPartial<TabularData>): TabularData {
    return TabularData.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TabularData>): TabularData {
    const message = createBaseTabularData();
    message.columns = object.columns?.map((e) => e) || [];
    message.columnTypes = Object.entries(object.columnTypes ?? {}).reduce<{ [key: string]: TabularData_ColumnType }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value as TabularData_ColumnType;
        }
        return acc;
      },
      {},
    );
    message.rows = object.rows?.map((e) => e) || [];
    message.generatedAt = object.generatedAt ?? undefined;
    message.cursor = object.cursor ?? "";
    return message;
  },
};

function createBaseTabularData_ColumnTypesEntry(): TabularData_ColumnTypesEntry {
  return { key: "", value: 0 };
}

export const TabularData_ColumnTypesEntry = {
  encode(message: TabularData_ColumnTypesEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).int32(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TabularData_ColumnTypesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTabularData_ColumnTypesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TabularData_ColumnTypesEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? tabularData_ColumnTypeFromJSON(object.value) : 0,
    };
  },

  toJSON(message: TabularData_ColumnTypesEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== 0) {
      obj.value = tabularData_ColumnTypeToJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<TabularData_ColumnTypesEntry>): TabularData_ColumnTypesEntry {
    return TabularData_ColumnTypesEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TabularData_ColumnTypesEntry>): TabularData_ColumnTypesEntry {
    const message = createBaseTabularData_ColumnTypesEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseAccount(): Account {
  return {
    name: "",
    id: "",
    contact: "",
    paymentInfo: undefined,
    ownerId: "",
    owner: undefined,
    address: "",
    paymentMethod: 0,
    usageOverCapLimit: "",
    status: "",
  };
}

export const Account = {
  encode(message: Account, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    if (message.contact !== "") {
      writer.uint32(26).string(message.contact);
    }
    if (message.paymentInfo !== undefined) {
      Struct.encode(Struct.wrap(message.paymentInfo), writer.uint32(34).fork()).ldelim();
    }
    if (message.ownerId !== "") {
      writer.uint32(58).string(message.ownerId);
    }
    if (message.owner !== undefined) {
      Owner.encode(message.owner, writer.uint32(66).fork()).ldelim();
    }
    if (message.address !== "") {
      writer.uint32(74).string(message.address);
    }
    if (message.paymentMethod !== 0) {
      writer.uint32(80).int32(message.paymentMethod);
    }
    if (message.usageOverCapLimit !== "") {
      writer.uint32(90).string(message.usageOverCapLimit);
    }
    if (message.status !== "") {
      writer.uint32(98).string(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Account {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.contact = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.paymentInfo = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.ownerId = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.owner = Owner.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.address = reader.string();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.paymentMethod = reader.int32() as any;
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.usageOverCapLimit = reader.string();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.status = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Account {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      contact: isSet(object.contact) ? globalThis.String(object.contact) : "",
      paymentInfo: isObject(object.paymentInfo) ? object.paymentInfo : undefined,
      ownerId: isSet(object.ownerId) ? globalThis.String(object.ownerId) : "",
      owner: isSet(object.owner) ? Owner.fromJSON(object.owner) : undefined,
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      paymentMethod: isSet(object.paymentMethod) ? payMethodFromJSON(object.paymentMethod) : 0,
      usageOverCapLimit: isSet(object.usageOverCapLimit) ? globalThis.String(object.usageOverCapLimit) : "",
      status: isSet(object.status) ? globalThis.String(object.status) : "",
    };
  },

  toJSON(message: Account): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.contact !== "") {
      obj.contact = message.contact;
    }
    if (message.paymentInfo !== undefined) {
      obj.paymentInfo = message.paymentInfo;
    }
    if (message.ownerId !== "") {
      obj.ownerId = message.ownerId;
    }
    if (message.owner !== undefined) {
      obj.owner = Owner.toJSON(message.owner);
    }
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.paymentMethod !== 0) {
      obj.paymentMethod = payMethodToJSON(message.paymentMethod);
    }
    if (message.usageOverCapLimit !== "") {
      obj.usageOverCapLimit = message.usageOverCapLimit;
    }
    if (message.status !== "") {
      obj.status = message.status;
    }
    return obj;
  },

  create(base?: DeepPartial<Account>): Account {
    return Account.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Account>): Account {
    const message = createBaseAccount();
    message.name = object.name ?? "";
    message.id = object.id ?? "";
    message.contact = object.contact ?? "";
    message.paymentInfo = object.paymentInfo ?? undefined;
    message.ownerId = object.ownerId ?? "";
    message.owner = (object.owner !== undefined && object.owner !== null) ? Owner.fromPartial(object.owner) : undefined;
    message.address = object.address ?? "";
    message.paymentMethod = object.paymentMethod ?? 0;
    message.usageOverCapLimit = object.usageOverCapLimit ?? "";
    message.status = object.status ?? "";
    return message;
  },
};

function createBaseImportedProject(): ImportedProject {
  return { name: "", project: undefined, imported: undefined };
}

export const ImportedProject = {
  encode(message: ImportedProject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.project !== undefined) {
      Project.encode(message.project, writer.uint32(18).fork()).ldelim();
    }
    if (message.imported !== undefined) {
      Project.encode(message.imported, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImportedProject {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseImportedProject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.project = Project.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.imported = Project.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ImportedProject {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      project: isSet(object.project) ? Project.fromJSON(object.project) : undefined,
      imported: isSet(object.imported) ? Project.fromJSON(object.imported) : undefined,
    };
  },

  toJSON(message: ImportedProject): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.project !== undefined) {
      obj.project = Project.toJSON(message.project);
    }
    if (message.imported !== undefined) {
      obj.imported = Project.toJSON(message.imported);
    }
    return obj;
  },

  create(base?: DeepPartial<ImportedProject>): ImportedProject {
    return ImportedProject.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ImportedProject>): ImportedProject {
    const message = createBaseImportedProject();
    message.name = object.name ?? "";
    message.project = (object.project !== undefined && object.project !== null)
      ? Project.fromPartial(object.project)
      : undefined;
    message.imported = (object.imported !== undefined && object.imported !== null)
      ? Project.fromPartial(object.imported)
      : undefined;
    return message;
  },
};

function createBaseProjectSuperset(): ProjectSuperset {
  return { projectId: "", createdAt: undefined, syncAt: undefined };
}

export const ProjectSuperset = {
  encode(message: ProjectSuperset, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.projectId !== "") {
      writer.uint32(10).string(message.projectId);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    if (message.syncAt !== undefined) {
      Timestamp.encode(toTimestamp(message.syncAt), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectSuperset {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectSuperset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.projectId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.syncAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProjectSuperset {
    return {
      projectId: isSet(object.projectId) ? globalThis.String(object.projectId) : "",
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      syncAt: isSet(object.syncAt) ? fromJsonTimestamp(object.syncAt) : undefined,
    };
  },

  toJSON(message: ProjectSuperset): unknown {
    const obj: any = {};
    if (message.projectId !== "") {
      obj.projectId = message.projectId;
    }
    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }
    if (message.syncAt !== undefined) {
      obj.syncAt = message.syncAt.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<ProjectSuperset>): ProjectSuperset {
    return ProjectSuperset.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProjectSuperset>): ProjectSuperset {
    const message = createBaseProjectSuperset();
    message.projectId = object.projectId ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.syncAt = object.syncAt ?? undefined;
    return message;
  },
};

function createBaseSegmentParameter(): SegmentParameter {
  return { cohortId: undefined, allUsers: undefined };
}

export const SegmentParameter = {
  encode(message: SegmentParameter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cohortId !== undefined) {
      writer.uint32(10).string(message.cohortId);
    }
    if (message.allUsers !== undefined) {
      writer.uint32(16).bool(message.allUsers);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SegmentParameter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSegmentParameter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.cohortId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.allUsers = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SegmentParameter {
    return {
      cohortId: isSet(object.cohortId) ? globalThis.String(object.cohortId) : undefined,
      allUsers: isSet(object.allUsers) ? globalThis.Boolean(object.allUsers) : undefined,
    };
  },

  toJSON(message: SegmentParameter): unknown {
    const obj: any = {};
    if (message.cohortId !== undefined) {
      obj.cohortId = message.cohortId;
    }
    if (message.allUsers !== undefined) {
      obj.allUsers = message.allUsers;
    }
    return obj;
  },

  create(base?: DeepPartial<SegmentParameter>): SegmentParameter {
    return SegmentParameter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SegmentParameter>): SegmentParameter {
    const message = createBaseSegmentParameter();
    message.cohortId = object.cohortId ?? undefined;
    message.allUsers = object.allUsers ?? undefined;
    return message;
  },
};

function createBaseRetentionQuery(): RetentionQuery {
  return {
    resources: [],
    criteria: 0,
    interval: undefined,
    selectorExpr: undefined,
    groupBy: [],
    segmentBy: [],
    windowSize: 0,
  };
}

export const RetentionQuery = {
  encode(message: RetentionQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.resources) {
      RetentionQuery_Resource.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.criteria !== 0) {
      writer.uint32(16).int32(message.criteria);
    }
    if (message.interval !== undefined) {
      RetentionQuery_Interval.encode(message.interval, writer.uint32(26).fork()).ldelim();
    }
    if (message.selectorExpr !== undefined) {
      SelectorExpr.encode(message.selectorExpr, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.groupBy) {
      writer.uint32(42).string(v!);
    }
    for (const v of message.segmentBy) {
      SegmentParameter.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.windowSize !== 0) {
      writer.uint32(56).int32(message.windowSize);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionQuery {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.resources.push(RetentionQuery_Resource.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.criteria = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.interval = RetentionQuery_Interval.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.selectorExpr = SelectorExpr.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.groupBy.push(reader.string());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.segmentBy.push(SegmentParameter.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.windowSize = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionQuery {
    return {
      resources: globalThis.Array.isArray(object?.resources)
        ? object.resources.map((e: any) => RetentionQuery_Resource.fromJSON(e))
        : [],
      criteria: isSet(object.criteria) ? retentionQuery_CriteriaFromJSON(object.criteria) : 0,
      interval: isSet(object.interval) ? RetentionQuery_Interval.fromJSON(object.interval) : undefined,
      selectorExpr: isSet(object.selectorExpr) ? SelectorExpr.fromJSON(object.selectorExpr) : undefined,
      groupBy: globalThis.Array.isArray(object?.groupBy) ? object.groupBy.map((e: any) => globalThis.String(e)) : [],
      segmentBy: globalThis.Array.isArray(object?.segmentBy)
        ? object.segmentBy.map((e: any) => SegmentParameter.fromJSON(e))
        : [],
      windowSize: isSet(object.windowSize) ? globalThis.Number(object.windowSize) : 0,
    };
  },

  toJSON(message: RetentionQuery): unknown {
    const obj: any = {};
    if (message.resources?.length) {
      obj.resources = message.resources.map((e) => RetentionQuery_Resource.toJSON(e));
    }
    if (message.criteria !== 0) {
      obj.criteria = retentionQuery_CriteriaToJSON(message.criteria);
    }
    if (message.interval !== undefined) {
      obj.interval = RetentionQuery_Interval.toJSON(message.interval);
    }
    if (message.selectorExpr !== undefined) {
      obj.selectorExpr = SelectorExpr.toJSON(message.selectorExpr);
    }
    if (message.groupBy?.length) {
      obj.groupBy = message.groupBy;
    }
    if (message.segmentBy?.length) {
      obj.segmentBy = message.segmentBy.map((e) => SegmentParameter.toJSON(e));
    }
    if (message.windowSize !== 0) {
      obj.windowSize = Math.round(message.windowSize);
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionQuery>): RetentionQuery {
    return RetentionQuery.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionQuery>): RetentionQuery {
    const message = createBaseRetentionQuery();
    message.resources = object.resources?.map((e) => RetentionQuery_Resource.fromPartial(e)) || [];
    message.criteria = object.criteria ?? 0;
    message.interval = (object.interval !== undefined && object.interval !== null)
      ? RetentionQuery_Interval.fromPartial(object.interval)
      : undefined;
    message.selectorExpr = (object.selectorExpr !== undefined && object.selectorExpr !== null)
      ? SelectorExpr.fromPartial(object.selectorExpr)
      : undefined;
    message.groupBy = object.groupBy?.map((e) => e) || [];
    message.segmentBy = object.segmentBy?.map((e) => SegmentParameter.fromPartial(e)) || [];
    message.windowSize = object.windowSize ?? 0;
    return message;
  },
};

function createBaseRetentionQuery_Filter(): RetentionQuery_Filter {
  return { propertyFilter: undefined, timeFilter: undefined };
}

export const RetentionQuery_Filter = {
  encode(message: RetentionQuery_Filter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.propertyFilter !== undefined) {
      SelectorExpr.encode(message.propertyFilter, writer.uint32(10).fork()).ldelim();
    }
    if (message.timeFilter !== undefined) {
      RetentionQuery_Filter_TimeFilter.encode(message.timeFilter, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionQuery_Filter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionQuery_Filter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.propertyFilter = SelectorExpr.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timeFilter = RetentionQuery_Filter_TimeFilter.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionQuery_Filter {
    return {
      propertyFilter: isSet(object.propertyFilter) ? SelectorExpr.fromJSON(object.propertyFilter) : undefined,
      timeFilter: isSet(object.timeFilter) ? RetentionQuery_Filter_TimeFilter.fromJSON(object.timeFilter) : undefined,
    };
  },

  toJSON(message: RetentionQuery_Filter): unknown {
    const obj: any = {};
    if (message.propertyFilter !== undefined) {
      obj.propertyFilter = SelectorExpr.toJSON(message.propertyFilter);
    }
    if (message.timeFilter !== undefined) {
      obj.timeFilter = RetentionQuery_Filter_TimeFilter.toJSON(message.timeFilter);
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionQuery_Filter>): RetentionQuery_Filter {
    return RetentionQuery_Filter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionQuery_Filter>): RetentionQuery_Filter {
    const message = createBaseRetentionQuery_Filter();
    message.propertyFilter = (object.propertyFilter !== undefined && object.propertyFilter !== null)
      ? SelectorExpr.fromPartial(object.propertyFilter)
      : undefined;
    message.timeFilter = (object.timeFilter !== undefined && object.timeFilter !== null)
      ? RetentionQuery_Filter_TimeFilter.fromPartial(object.timeFilter)
      : undefined;
    return message;
  },
};

function createBaseRetentionQuery_Filter_TimeFilter(): RetentionQuery_Filter_TimeFilter {
  return { type: 0 };
}

export const RetentionQuery_Filter_TimeFilter = {
  encode(message: RetentionQuery_Filter_TimeFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionQuery_Filter_TimeFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionQuery_Filter_TimeFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionQuery_Filter_TimeFilter {
    return { type: isSet(object.type) ? retentionQuery_Filter_TimeFilter_TypeFromJSON(object.type) : 0 };
  },

  toJSON(message: RetentionQuery_Filter_TimeFilter): unknown {
    const obj: any = {};
    if (message.type !== 0) {
      obj.type = retentionQuery_Filter_TimeFilter_TypeToJSON(message.type);
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionQuery_Filter_TimeFilter>): RetentionQuery_Filter_TimeFilter {
    return RetentionQuery_Filter_TimeFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionQuery_Filter_TimeFilter>): RetentionQuery_Filter_TimeFilter {
    const message = createBaseRetentionQuery_Filter_TimeFilter();
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseRetentionQuery_Resource(): RetentionQuery_Resource {
  return { eventNames: [], filter: undefined };
}

export const RetentionQuery_Resource = {
  encode(message: RetentionQuery_Resource, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.eventNames) {
      writer.uint32(10).string(v!);
    }
    if (message.filter !== undefined) {
      RetentionQuery_Filter.encode(message.filter, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionQuery_Resource {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionQuery_Resource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.eventNames.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.filter = RetentionQuery_Filter.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionQuery_Resource {
    return {
      eventNames: globalThis.Array.isArray(object?.eventNames)
        ? object.eventNames.map((e: any) => globalThis.String(e))
        : [],
      filter: isSet(object.filter) ? RetentionQuery_Filter.fromJSON(object.filter) : undefined,
    };
  },

  toJSON(message: RetentionQuery_Resource): unknown {
    const obj: any = {};
    if (message.eventNames?.length) {
      obj.eventNames = message.eventNames;
    }
    if (message.filter !== undefined) {
      obj.filter = RetentionQuery_Filter.toJSON(message.filter);
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionQuery_Resource>): RetentionQuery_Resource {
    return RetentionQuery_Resource.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionQuery_Resource>): RetentionQuery_Resource {
    const message = createBaseRetentionQuery_Resource();
    message.eventNames = object.eventNames?.map((e) => e) || [];
    message.filter = (object.filter !== undefined && object.filter !== null)
      ? RetentionQuery_Filter.fromPartial(object.filter)
      : undefined;
    return message;
  },
};

function createBaseRetentionQuery_Interval(): RetentionQuery_Interval {
  return { value: 0, unit: 0 };
}

export const RetentionQuery_Interval = {
  encode(message: RetentionQuery_Interval, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value !== 0) {
      writer.uint32(8).int32(message.value);
    }
    if (message.unit !== 0) {
      writer.uint32(16).int32(message.unit);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionQuery_Interval {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionQuery_Interval();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.value = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.unit = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionQuery_Interval {
    return {
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
      unit: isSet(object.unit) ? retentionQuery_Interval_UnitFromJSON(object.unit) : 0,
    };
  },

  toJSON(message: RetentionQuery_Interval): unknown {
    const obj: any = {};
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    if (message.unit !== 0) {
      obj.unit = retentionQuery_Interval_UnitToJSON(message.unit);
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionQuery_Interval>): RetentionQuery_Interval {
    return RetentionQuery_Interval.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionQuery_Interval>): RetentionQuery_Interval {
    const message = createBaseRetentionQuery_Interval();
    message.value = object.value ?? 0;
    message.unit = object.unit ?? 0;
    return message;
  },
};

function createBaseRetentionMatrix(): RetentionMatrix {
  return { samples: [] };
}

export const RetentionMatrix = {
  encode(message: RetentionMatrix, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.samples) {
      RetentionMatrix_Sample.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionMatrix {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionMatrix();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.samples.push(RetentionMatrix_Sample.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionMatrix {
    return {
      samples: globalThis.Array.isArray(object?.samples)
        ? object.samples.map((e: any) => RetentionMatrix_Sample.fromJSON(e))
        : [],
    };
  },

  toJSON(message: RetentionMatrix): unknown {
    const obj: any = {};
    if (message.samples?.length) {
      obj.samples = message.samples.map((e) => RetentionMatrix_Sample.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionMatrix>): RetentionMatrix {
    return RetentionMatrix.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionMatrix>): RetentionMatrix {
    const message = createBaseRetentionMatrix();
    message.samples = object.samples?.map((e) => RetentionMatrix_Sample.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRetentionMatrix_Sample(): RetentionMatrix_Sample {
  return { time: undefined, segmentParameter: undefined, labels: {}, totalCount: 0, counts: [], rates: [] };
}

export const RetentionMatrix_Sample = {
  encode(message: RetentionMatrix_Sample, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.time !== undefined) {
      Timestamp.encode(toTimestamp(message.time), writer.uint32(10).fork()).ldelim();
    }
    if (message.segmentParameter !== undefined) {
      SegmentParameter.encode(message.segmentParameter, writer.uint32(18).fork()).ldelim();
    }
    Object.entries(message.labels).forEach(([key, value]) => {
      RetentionMatrix_Sample_LabelsEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    if (message.totalCount !== 0) {
      writer.uint32(32).int32(message.totalCount);
    }
    writer.uint32(42).fork();
    for (const v of message.counts) {
      writer.int32(v);
    }
    writer.ldelim();
    writer.uint32(50).fork();
    for (const v of message.rates) {
      writer.double(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionMatrix_Sample {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionMatrix_Sample();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.time = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.segmentParameter = SegmentParameter.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          const entry3 = RetentionMatrix_Sample_LabelsEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.labels[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.totalCount = reader.int32();
          continue;
        case 5:
          if (tag === 40) {
            message.counts.push(reader.int32());

            continue;
          }

          if (tag === 42) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.counts.push(reader.int32());
            }

            continue;
          }

          break;
        case 6:
          if (tag === 49) {
            message.rates.push(reader.double());

            continue;
          }

          if (tag === 50) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.rates.push(reader.double());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionMatrix_Sample {
    return {
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      segmentParameter: isSet(object.segmentParameter) ? SegmentParameter.fromJSON(object.segmentParameter) : undefined,
      labels: isObject(object.labels)
        ? Object.entries(object.labels).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      totalCount: isSet(object.totalCount) ? globalThis.Number(object.totalCount) : 0,
      counts: globalThis.Array.isArray(object?.counts) ? object.counts.map((e: any) => globalThis.Number(e)) : [],
      rates: globalThis.Array.isArray(object?.rates) ? object.rates.map((e: any) => globalThis.Number(e)) : [],
    };
  },

  toJSON(message: RetentionMatrix_Sample): unknown {
    const obj: any = {};
    if (message.time !== undefined) {
      obj.time = message.time.toISOString();
    }
    if (message.segmentParameter !== undefined) {
      obj.segmentParameter = SegmentParameter.toJSON(message.segmentParameter);
    }
    if (message.labels) {
      const entries = Object.entries(message.labels);
      if (entries.length > 0) {
        obj.labels = {};
        entries.forEach(([k, v]) => {
          obj.labels[k] = v;
        });
      }
    }
    if (message.totalCount !== 0) {
      obj.totalCount = Math.round(message.totalCount);
    }
    if (message.counts?.length) {
      obj.counts = message.counts.map((e) => Math.round(e));
    }
    if (message.rates?.length) {
      obj.rates = message.rates;
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionMatrix_Sample>): RetentionMatrix_Sample {
    return RetentionMatrix_Sample.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionMatrix_Sample>): RetentionMatrix_Sample {
    const message = createBaseRetentionMatrix_Sample();
    message.time = object.time ?? undefined;
    message.segmentParameter = (object.segmentParameter !== undefined && object.segmentParameter !== null)
      ? SegmentParameter.fromPartial(object.segmentParameter)
      : undefined;
    message.labels = Object.entries(object.labels ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.totalCount = object.totalCount ?? 0;
    message.counts = object.counts?.map((e) => e) || [];
    message.rates = object.rates?.map((e) => e) || [];
    return message;
  },
};

function createBaseRetentionMatrix_Sample_LabelsEntry(): RetentionMatrix_Sample_LabelsEntry {
  return { key: "", value: "" };
}

export const RetentionMatrix_Sample_LabelsEntry = {
  encode(message: RetentionMatrix_Sample_LabelsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionMatrix_Sample_LabelsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionMatrix_Sample_LabelsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionMatrix_Sample_LabelsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: RetentionMatrix_Sample_LabelsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionMatrix_Sample_LabelsEntry>): RetentionMatrix_Sample_LabelsEntry {
    return RetentionMatrix_Sample_LabelsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionMatrix_Sample_LabelsEntry>): RetentionMatrix_Sample_LabelsEntry {
    const message = createBaseRetentionMatrix_Sample_LabelsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseComputeStats(): ComputeStats {
  return {
    computedAt: undefined,
    computeCostMs: BigInt("0"),
    binaryVersionHash: BigInt("0"),
    computedBy: "",
    isCached: false,
    isRefreshing: false,
    clickhouseStats: undefined,
  };
}

export const ComputeStats = {
  encode(message: ComputeStats, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.computedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.computedAt), writer.uint32(10).fork()).ldelim();
    }
    if (message.computeCostMs !== BigInt("0")) {
      if (BigInt.asIntN(64, message.computeCostMs) !== message.computeCostMs) {
        throw new globalThis.Error("value provided for field message.computeCostMs of type int64 too large");
      }
      writer.uint32(16).int64(message.computeCostMs.toString());
    }
    if (message.binaryVersionHash !== BigInt("0")) {
      if (BigInt.asUintN(64, message.binaryVersionHash) !== message.binaryVersionHash) {
        throw new globalThis.Error("value provided for field message.binaryVersionHash of type uint64 too large");
      }
      writer.uint32(24).uint64(message.binaryVersionHash.toString());
    }
    if (message.computedBy !== "") {
      writer.uint32(34).string(message.computedBy);
    }
    if (message.isCached !== false) {
      writer.uint32(40).bool(message.isCached);
    }
    if (message.isRefreshing !== false) {
      writer.uint32(48).bool(message.isRefreshing);
    }
    if (message.clickhouseStats !== undefined) {
      ComputeStats_ClickhouseStats.encode(message.clickhouseStats, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComputeStats {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComputeStats();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.computedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.computeCostMs = longToBigint(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.binaryVersionHash = longToBigint(reader.uint64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.computedBy = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.isCached = reader.bool();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.isRefreshing = reader.bool();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.clickhouseStats = ComputeStats_ClickhouseStats.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ComputeStats {
    return {
      computedAt: isSet(object.computedAt) ? fromJsonTimestamp(object.computedAt) : undefined,
      computeCostMs: isSet(object.computeCostMs) ? BigInt(object.computeCostMs) : BigInt("0"),
      binaryVersionHash: isSet(object.binaryVersionHash) ? BigInt(object.binaryVersionHash) : BigInt("0"),
      computedBy: isSet(object.computedBy) ? globalThis.String(object.computedBy) : "",
      isCached: isSet(object.isCached) ? globalThis.Boolean(object.isCached) : false,
      isRefreshing: isSet(object.isRefreshing) ? globalThis.Boolean(object.isRefreshing) : false,
      clickhouseStats: isSet(object.clickhouseStats)
        ? ComputeStats_ClickhouseStats.fromJSON(object.clickhouseStats)
        : undefined,
    };
  },

  toJSON(message: ComputeStats): unknown {
    const obj: any = {};
    if (message.computedAt !== undefined) {
      obj.computedAt = message.computedAt.toISOString();
    }
    if (message.computeCostMs !== BigInt("0")) {
      obj.computeCostMs = message.computeCostMs.toString();
    }
    if (message.binaryVersionHash !== BigInt("0")) {
      obj.binaryVersionHash = message.binaryVersionHash.toString();
    }
    if (message.computedBy !== "") {
      obj.computedBy = message.computedBy;
    }
    if (message.isCached !== false) {
      obj.isCached = message.isCached;
    }
    if (message.isRefreshing !== false) {
      obj.isRefreshing = message.isRefreshing;
    }
    if (message.clickhouseStats !== undefined) {
      obj.clickhouseStats = ComputeStats_ClickhouseStats.toJSON(message.clickhouseStats);
    }
    return obj;
  },

  create(base?: DeepPartial<ComputeStats>): ComputeStats {
    return ComputeStats.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComputeStats>): ComputeStats {
    const message = createBaseComputeStats();
    message.computedAt = object.computedAt ?? undefined;
    message.computeCostMs = object.computeCostMs ?? BigInt("0");
    message.binaryVersionHash = object.binaryVersionHash ?? BigInt("0");
    message.computedBy = object.computedBy ?? "";
    message.isCached = object.isCached ?? false;
    message.isRefreshing = object.isRefreshing ?? false;
    message.clickhouseStats = (object.clickhouseStats !== undefined && object.clickhouseStats !== null)
      ? ComputeStats_ClickhouseStats.fromPartial(object.clickhouseStats)
      : undefined;
    return message;
  },
};

function createBaseComputeStats_ClickhouseStats(): ComputeStats_ClickhouseStats {
  return {
    readRows: BigInt("0"),
    readBytes: BigInt("0"),
    memoryUsage: BigInt("0"),
    queryDurationMs: BigInt("0"),
    resultRows: BigInt("0"),
    resultBytes: BigInt("0"),
  };
}

export const ComputeStats_ClickhouseStats = {
  encode(message: ComputeStats_ClickhouseStats, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.readRows !== BigInt("0")) {
      if (BigInt.asUintN(64, message.readRows) !== message.readRows) {
        throw new globalThis.Error("value provided for field message.readRows of type uint64 too large");
      }
      writer.uint32(8).uint64(message.readRows.toString());
    }
    if (message.readBytes !== BigInt("0")) {
      if (BigInt.asUintN(64, message.readBytes) !== message.readBytes) {
        throw new globalThis.Error("value provided for field message.readBytes of type uint64 too large");
      }
      writer.uint32(16).uint64(message.readBytes.toString());
    }
    if (message.memoryUsage !== BigInt("0")) {
      if (BigInt.asUintN(64, message.memoryUsage) !== message.memoryUsage) {
        throw new globalThis.Error("value provided for field message.memoryUsage of type uint64 too large");
      }
      writer.uint32(24).uint64(message.memoryUsage.toString());
    }
    if (message.queryDurationMs !== BigInt("0")) {
      if (BigInt.asUintN(64, message.queryDurationMs) !== message.queryDurationMs) {
        throw new globalThis.Error("value provided for field message.queryDurationMs of type uint64 too large");
      }
      writer.uint32(32).uint64(message.queryDurationMs.toString());
    }
    if (message.resultRows !== BigInt("0")) {
      if (BigInt.asUintN(64, message.resultRows) !== message.resultRows) {
        throw new globalThis.Error("value provided for field message.resultRows of type uint64 too large");
      }
      writer.uint32(40).uint64(message.resultRows.toString());
    }
    if (message.resultBytes !== BigInt("0")) {
      if (BigInt.asUintN(64, message.resultBytes) !== message.resultBytes) {
        throw new globalThis.Error("value provided for field message.resultBytes of type uint64 too large");
      }
      writer.uint32(48).uint64(message.resultBytes.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComputeStats_ClickhouseStats {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComputeStats_ClickhouseStats();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.readRows = longToBigint(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.readBytes = longToBigint(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.memoryUsage = longToBigint(reader.uint64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.queryDurationMs = longToBigint(reader.uint64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.resultRows = longToBigint(reader.uint64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.resultBytes = longToBigint(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ComputeStats_ClickhouseStats {
    return {
      readRows: isSet(object.readRows) ? BigInt(object.readRows) : BigInt("0"),
      readBytes: isSet(object.readBytes) ? BigInt(object.readBytes) : BigInt("0"),
      memoryUsage: isSet(object.memoryUsage) ? BigInt(object.memoryUsage) : BigInt("0"),
      queryDurationMs: isSet(object.queryDurationMs) ? BigInt(object.queryDurationMs) : BigInt("0"),
      resultRows: isSet(object.resultRows) ? BigInt(object.resultRows) : BigInt("0"),
      resultBytes: isSet(object.resultBytes) ? BigInt(object.resultBytes) : BigInt("0"),
    };
  },

  toJSON(message: ComputeStats_ClickhouseStats): unknown {
    const obj: any = {};
    if (message.readRows !== BigInt("0")) {
      obj.readRows = message.readRows.toString();
    }
    if (message.readBytes !== BigInt("0")) {
      obj.readBytes = message.readBytes.toString();
    }
    if (message.memoryUsage !== BigInt("0")) {
      obj.memoryUsage = message.memoryUsage.toString();
    }
    if (message.queryDurationMs !== BigInt("0")) {
      obj.queryDurationMs = message.queryDurationMs.toString();
    }
    if (message.resultRows !== BigInt("0")) {
      obj.resultRows = message.resultRows.toString();
    }
    if (message.resultBytes !== BigInt("0")) {
      obj.resultBytes = message.resultBytes.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<ComputeStats_ClickhouseStats>): ComputeStats_ClickhouseStats {
    return ComputeStats_ClickhouseStats.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComputeStats_ClickhouseStats>): ComputeStats_ClickhouseStats {
    const message = createBaseComputeStats_ClickhouseStats();
    message.readRows = object.readRows ?? BigInt("0");
    message.readBytes = object.readBytes ?? BigInt("0");
    message.memoryUsage = object.memoryUsage ?? BigInt("0");
    message.queryDurationMs = object.queryDurationMs ?? BigInt("0");
    message.resultRows = object.resultRows ?? BigInt("0");
    message.resultBytes = object.resultBytes ?? BigInt("0");
    return message;
  },
};

function createBaseClickhouseStatus(): ClickhouseStatus {
  return { mutations: {}, processes: {} };
}

export const ClickhouseStatus = {
  encode(message: ClickhouseStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.mutations).forEach(([key, value]) => {
      ClickhouseStatus_MutationsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    Object.entries(message.processes).forEach(([key, value]) => {
      ClickhouseStatus_ProcessesEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClickhouseStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClickhouseStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = ClickhouseStatus_MutationsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.mutations[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = ClickhouseStatus_ProcessesEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.processes[entry2.key] = entry2.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ClickhouseStatus {
    return {
      mutations: isObject(object.mutations)
        ? Object.entries(object.mutations).reduce<{ [key: number]: ClickhouseStatus_Mutation }>((acc, [key, value]) => {
          acc[globalThis.Number(key)] = ClickhouseStatus_Mutation.fromJSON(value);
          return acc;
        }, {})
        : {},
      processes: isObject(object.processes)
        ? Object.entries(object.processes).reduce<{ [key: number]: ClickhouseStatus_Processes }>(
          (acc, [key, value]) => {
            acc[globalThis.Number(key)] = ClickhouseStatus_Processes.fromJSON(value);
            return acc;
          },
          {},
        )
        : {},
    };
  },

  toJSON(message: ClickhouseStatus): unknown {
    const obj: any = {};
    if (message.mutations) {
      const entries = Object.entries(message.mutations);
      if (entries.length > 0) {
        obj.mutations = {};
        entries.forEach(([k, v]) => {
          obj.mutations[k] = ClickhouseStatus_Mutation.toJSON(v);
        });
      }
    }
    if (message.processes) {
      const entries = Object.entries(message.processes);
      if (entries.length > 0) {
        obj.processes = {};
        entries.forEach(([k, v]) => {
          obj.processes[k] = ClickhouseStatus_Processes.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<ClickhouseStatus>): ClickhouseStatus {
    return ClickhouseStatus.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ClickhouseStatus>): ClickhouseStatus {
    const message = createBaseClickhouseStatus();
    message.mutations = Object.entries(object.mutations ?? {}).reduce<{ [key: number]: ClickhouseStatus_Mutation }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[globalThis.Number(key)] = ClickhouseStatus_Mutation.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    message.processes = Object.entries(object.processes ?? {}).reduce<{ [key: number]: ClickhouseStatus_Processes }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[globalThis.Number(key)] = ClickhouseStatus_Processes.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseClickhouseStatus_Mutation(): ClickhouseStatus_Mutation {
  return { undoneCnt: 0 };
}

export const ClickhouseStatus_Mutation = {
  encode(message: ClickhouseStatus_Mutation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.undoneCnt !== 0) {
      writer.uint32(8).int32(message.undoneCnt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClickhouseStatus_Mutation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClickhouseStatus_Mutation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.undoneCnt = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ClickhouseStatus_Mutation {
    return { undoneCnt: isSet(object.undoneCnt) ? globalThis.Number(object.undoneCnt) : 0 };
  },

  toJSON(message: ClickhouseStatus_Mutation): unknown {
    const obj: any = {};
    if (message.undoneCnt !== 0) {
      obj.undoneCnt = Math.round(message.undoneCnt);
    }
    return obj;
  },

  create(base?: DeepPartial<ClickhouseStatus_Mutation>): ClickhouseStatus_Mutation {
    return ClickhouseStatus_Mutation.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ClickhouseStatus_Mutation>): ClickhouseStatus_Mutation {
    const message = createBaseClickhouseStatus_Mutation();
    message.undoneCnt = object.undoneCnt ?? 0;
    return message;
  },
};

function createBaseClickhouseStatus_Process(): ClickhouseStatus_Process {
  return { query: "", queryKind: "", elapsed: 0 };
}

export const ClickhouseStatus_Process = {
  encode(message: ClickhouseStatus_Process, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.query !== "") {
      writer.uint32(10).string(message.query);
    }
    if (message.queryKind !== "") {
      writer.uint32(18).string(message.queryKind);
    }
    if (message.elapsed !== 0) {
      writer.uint32(25).double(message.elapsed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClickhouseStatus_Process {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClickhouseStatus_Process();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.query = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.queryKind = reader.string();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.elapsed = reader.double();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ClickhouseStatus_Process {
    return {
      query: isSet(object.query) ? globalThis.String(object.query) : "",
      queryKind: isSet(object.queryKind) ? globalThis.String(object.queryKind) : "",
      elapsed: isSet(object.elapsed) ? globalThis.Number(object.elapsed) : 0,
    };
  },

  toJSON(message: ClickhouseStatus_Process): unknown {
    const obj: any = {};
    if (message.query !== "") {
      obj.query = message.query;
    }
    if (message.queryKind !== "") {
      obj.queryKind = message.queryKind;
    }
    if (message.elapsed !== 0) {
      obj.elapsed = message.elapsed;
    }
    return obj;
  },

  create(base?: DeepPartial<ClickhouseStatus_Process>): ClickhouseStatus_Process {
    return ClickhouseStatus_Process.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ClickhouseStatus_Process>): ClickhouseStatus_Process {
    const message = createBaseClickhouseStatus_Process();
    message.query = object.query ?? "";
    message.queryKind = object.queryKind ?? "";
    message.elapsed = object.elapsed ?? 0;
    return message;
  },
};

function createBaseClickhouseStatus_Processes(): ClickhouseStatus_Processes {
  return { processes: [] };
}

export const ClickhouseStatus_Processes = {
  encode(message: ClickhouseStatus_Processes, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.processes) {
      ClickhouseStatus_Process.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClickhouseStatus_Processes {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClickhouseStatus_Processes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.processes.push(ClickhouseStatus_Process.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ClickhouseStatus_Processes {
    return {
      processes: globalThis.Array.isArray(object?.processes)
        ? object.processes.map((e: any) => ClickhouseStatus_Process.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ClickhouseStatus_Processes): unknown {
    const obj: any = {};
    if (message.processes?.length) {
      obj.processes = message.processes.map((e) => ClickhouseStatus_Process.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<ClickhouseStatus_Processes>): ClickhouseStatus_Processes {
    return ClickhouseStatus_Processes.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ClickhouseStatus_Processes>): ClickhouseStatus_Processes {
    const message = createBaseClickhouseStatus_Processes();
    message.processes = object.processes?.map((e) => ClickhouseStatus_Process.fromPartial(e)) || [];
    return message;
  },
};

function createBaseClickhouseStatus_MutationsEntry(): ClickhouseStatus_MutationsEntry {
  return { key: 0, value: undefined };
}

export const ClickhouseStatus_MutationsEntry = {
  encode(message: ClickhouseStatus_MutationsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int32(message.key);
    }
    if (message.value !== undefined) {
      ClickhouseStatus_Mutation.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClickhouseStatus_MutationsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClickhouseStatus_MutationsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = ClickhouseStatus_Mutation.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ClickhouseStatus_MutationsEntry {
    return {
      key: isSet(object.key) ? globalThis.Number(object.key) : 0,
      value: isSet(object.value) ? ClickhouseStatus_Mutation.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: ClickhouseStatus_MutationsEntry): unknown {
    const obj: any = {};
    if (message.key !== 0) {
      obj.key = Math.round(message.key);
    }
    if (message.value !== undefined) {
      obj.value = ClickhouseStatus_Mutation.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<ClickhouseStatus_MutationsEntry>): ClickhouseStatus_MutationsEntry {
    return ClickhouseStatus_MutationsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ClickhouseStatus_MutationsEntry>): ClickhouseStatus_MutationsEntry {
    const message = createBaseClickhouseStatus_MutationsEntry();
    message.key = object.key ?? 0;
    message.value = (object.value !== undefined && object.value !== null)
      ? ClickhouseStatus_Mutation.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseClickhouseStatus_ProcessesEntry(): ClickhouseStatus_ProcessesEntry {
  return { key: 0, value: undefined };
}

export const ClickhouseStatus_ProcessesEntry = {
  encode(message: ClickhouseStatus_ProcessesEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int32(message.key);
    }
    if (message.value !== undefined) {
      ClickhouseStatus_Processes.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClickhouseStatus_ProcessesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClickhouseStatus_ProcessesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = ClickhouseStatus_Processes.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ClickhouseStatus_ProcessesEntry {
    return {
      key: isSet(object.key) ? globalThis.Number(object.key) : 0,
      value: isSet(object.value) ? ClickhouseStatus_Processes.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: ClickhouseStatus_ProcessesEntry): unknown {
    const obj: any = {};
    if (message.key !== 0) {
      obj.key = Math.round(message.key);
    }
    if (message.value !== undefined) {
      obj.value = ClickhouseStatus_Processes.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<ClickhouseStatus_ProcessesEntry>): ClickhouseStatus_ProcessesEntry {
    return ClickhouseStatus_ProcessesEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ClickhouseStatus_ProcessesEntry>): ClickhouseStatus_ProcessesEntry {
    const message = createBaseClickhouseStatus_ProcessesEntry();
    message.key = object.key ?? 0;
    message.value = (object.value !== undefined && object.value !== null)
      ? ClickhouseStatus_Processes.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseProjectVariables(): ProjectVariables {
  return { projectId: "", variables: [] };
}

export const ProjectVariables = {
  encode(message: ProjectVariables, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.projectId !== "") {
      writer.uint32(10).string(message.projectId);
    }
    for (const v of message.variables) {
      ProjectVariables_Variable.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectVariables {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectVariables();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.projectId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.variables.push(ProjectVariables_Variable.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProjectVariables {
    return {
      projectId: isSet(object.projectId) ? globalThis.String(object.projectId) : "",
      variables: globalThis.Array.isArray(object?.variables)
        ? object.variables.map((e: any) => ProjectVariables_Variable.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProjectVariables): unknown {
    const obj: any = {};
    if (message.projectId !== "") {
      obj.projectId = message.projectId;
    }
    if (message.variables?.length) {
      obj.variables = message.variables.map((e) => ProjectVariables_Variable.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<ProjectVariables>): ProjectVariables {
    return ProjectVariables.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProjectVariables>): ProjectVariables {
    const message = createBaseProjectVariables();
    message.projectId = object.projectId ?? "";
    message.variables = object.variables?.map((e) => ProjectVariables_Variable.fromPartial(e)) || [];
    return message;
  },
};

function createBaseProjectVariables_Variable(): ProjectVariables_Variable {
  return { key: "", value: "", isSecret: false, updatedAt: undefined };
}

export const ProjectVariables_Variable = {
  encode(message: ProjectVariables_Variable, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(26).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(34).string(message.value);
    }
    if (message.isSecret !== false) {
      writer.uint32(56).bool(message.isSecret);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectVariables_Variable {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectVariables_Variable();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 26) {
            break;
          }

          message.key = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.value = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.isSecret = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProjectVariables_Variable {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
      isSecret: isSet(object.isSecret) ? globalThis.Boolean(object.isSecret) : false,
      updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined,
    };
  },

  toJSON(message: ProjectVariables_Variable): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    if (message.isSecret !== false) {
      obj.isSecret = message.isSecret;
    }
    if (message.updatedAt !== undefined) {
      obj.updatedAt = message.updatedAt.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<ProjectVariables_Variable>): ProjectVariables_Variable {
    return ProjectVariables_Variable.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProjectVariables_Variable>): ProjectVariables_Variable {
    const message = createBaseProjectVariables_Variable();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    message.isSecret = object.isSecret ?? false;
    message.updatedAt = object.updatedAt ?? undefined;
    return message;
  },
};

function createBaseCachePolicy(): CachePolicy {
  return { cacheTtlSecs: 0, cacheRefreshTtlSecs: 0, forceRefresh: false, noCache: false };
}

export const CachePolicy = {
  encode(message: CachePolicy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cacheTtlSecs !== 0) {
      writer.uint32(8).int32(message.cacheTtlSecs);
    }
    if (message.cacheRefreshTtlSecs !== 0) {
      writer.uint32(16).int32(message.cacheRefreshTtlSecs);
    }
    if (message.forceRefresh !== false) {
      writer.uint32(24).bool(message.forceRefresh);
    }
    if (message.noCache !== false) {
      writer.uint32(32).bool(message.noCache);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CachePolicy {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCachePolicy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.cacheTtlSecs = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.cacheRefreshTtlSecs = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.forceRefresh = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.noCache = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CachePolicy {
    return {
      cacheTtlSecs: isSet(object.cacheTtlSecs) ? globalThis.Number(object.cacheTtlSecs) : 0,
      cacheRefreshTtlSecs: isSet(object.cacheRefreshTtlSecs) ? globalThis.Number(object.cacheRefreshTtlSecs) : 0,
      forceRefresh: isSet(object.forceRefresh) ? globalThis.Boolean(object.forceRefresh) : false,
      noCache: isSet(object.noCache) ? globalThis.Boolean(object.noCache) : false,
    };
  },

  toJSON(message: CachePolicy): unknown {
    const obj: any = {};
    if (message.cacheTtlSecs !== 0) {
      obj.cacheTtlSecs = Math.round(message.cacheTtlSecs);
    }
    if (message.cacheRefreshTtlSecs !== 0) {
      obj.cacheRefreshTtlSecs = Math.round(message.cacheRefreshTtlSecs);
    }
    if (message.forceRefresh !== false) {
      obj.forceRefresh = message.forceRefresh;
    }
    if (message.noCache !== false) {
      obj.noCache = message.noCache;
    }
    return obj;
  },

  create(base?: DeepPartial<CachePolicy>): CachePolicy {
    return CachePolicy.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CachePolicy>): CachePolicy {
    const message = createBaseCachePolicy();
    message.cacheTtlSecs = object.cacheTtlSecs ?? 0;
    message.cacheRefreshTtlSecs = object.cacheRefreshTtlSecs ?? 0;
    message.forceRefresh = object.forceRefresh ?? false;
    message.noCache = object.noCache ?? false;
    return message;
  },
};

function createBaseSystemSQLQuery(): SystemSQLQuery {
  return {
    id: "",
    alias: "",
    name: "",
    tableName: "",
    aggregation: undefined,
    selectorExpr: undefined,
    groupBy: [],
    disabled: false,
  };
}

export const SystemSQLQuery = {
  encode(message: SystemSQLQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.alias !== "") {
      writer.uint32(18).string(message.alias);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.tableName !== "") {
      writer.uint32(34).string(message.tableName);
    }
    if (message.aggregation !== undefined) {
      SystemSQLQuery_Aggregation.encode(message.aggregation, writer.uint32(42).fork()).ldelim();
    }
    if (message.selectorExpr !== undefined) {
      SelectorExpr.encode(message.selectorExpr, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.groupBy) {
      writer.uint32(58).string(v!);
    }
    if (message.disabled !== false) {
      writer.uint32(64).bool(message.disabled);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SystemSQLQuery {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSystemSQLQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.alias = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.tableName = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.aggregation = SystemSQLQuery_Aggregation.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.selectorExpr = SelectorExpr.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.groupBy.push(reader.string());
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.disabled = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SystemSQLQuery {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      alias: isSet(object.alias) ? globalThis.String(object.alias) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      tableName: isSet(object.tableName) ? globalThis.String(object.tableName) : "",
      aggregation: isSet(object.aggregation) ? SystemSQLQuery_Aggregation.fromJSON(object.aggregation) : undefined,
      selectorExpr: isSet(object.selectorExpr) ? SelectorExpr.fromJSON(object.selectorExpr) : undefined,
      groupBy: globalThis.Array.isArray(object?.groupBy) ? object.groupBy.map((e: any) => globalThis.String(e)) : [],
      disabled: isSet(object.disabled) ? globalThis.Boolean(object.disabled) : false,
    };
  },

  toJSON(message: SystemSQLQuery): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.alias !== "") {
      obj.alias = message.alias;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.tableName !== "") {
      obj.tableName = message.tableName;
    }
    if (message.aggregation !== undefined) {
      obj.aggregation = SystemSQLQuery_Aggregation.toJSON(message.aggregation);
    }
    if (message.selectorExpr !== undefined) {
      obj.selectorExpr = SelectorExpr.toJSON(message.selectorExpr);
    }
    if (message.groupBy?.length) {
      obj.groupBy = message.groupBy;
    }
    if (message.disabled !== false) {
      obj.disabled = message.disabled;
    }
    return obj;
  },

  create(base?: DeepPartial<SystemSQLQuery>): SystemSQLQuery {
    return SystemSQLQuery.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SystemSQLQuery>): SystemSQLQuery {
    const message = createBaseSystemSQLQuery();
    message.id = object.id ?? "";
    message.alias = object.alias ?? "";
    message.name = object.name ?? "";
    message.tableName = object.tableName ?? "";
    message.aggregation = (object.aggregation !== undefined && object.aggregation !== null)
      ? SystemSQLQuery_Aggregation.fromPartial(object.aggregation)
      : undefined;
    message.selectorExpr = (object.selectorExpr !== undefined && object.selectorExpr !== null)
      ? SelectorExpr.fromPartial(object.selectorExpr)
      : undefined;
    message.groupBy = object.groupBy?.map((e) => e) || [];
    message.disabled = object.disabled ?? false;
    return message;
  },
};

function createBaseSystemSQLQuery_Aggregation(): SystemSQLQuery_Aggregation {
  return { total: undefined, countUnique: undefined, aggregateProperties: undefined };
}

export const SystemSQLQuery_Aggregation = {
  encode(message: SystemSQLQuery_Aggregation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.total !== undefined) {
      SystemSQLQuery_Aggregation_Total.encode(message.total, writer.uint32(10).fork()).ldelim();
    }
    if (message.countUnique !== undefined) {
      SystemSQLQuery_Aggregation_CountUnique.encode(message.countUnique, writer.uint32(26).fork()).ldelim();
    }
    if (message.aggregateProperties !== undefined) {
      SystemSQLQuery_Aggregation_AggregateProperties.encode(message.aggregateProperties, writer.uint32(34).fork())
        .ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SystemSQLQuery_Aggregation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSystemSQLQuery_Aggregation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.total = SystemSQLQuery_Aggregation_Total.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.countUnique = SystemSQLQuery_Aggregation_CountUnique.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.aggregateProperties = SystemSQLQuery_Aggregation_AggregateProperties.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SystemSQLQuery_Aggregation {
    return {
      total: isSet(object.total) ? SystemSQLQuery_Aggregation_Total.fromJSON(object.total) : undefined,
      countUnique: isSet(object.countUnique)
        ? SystemSQLQuery_Aggregation_CountUnique.fromJSON(object.countUnique)
        : undefined,
      aggregateProperties: isSet(object.aggregateProperties)
        ? SystemSQLQuery_Aggregation_AggregateProperties.fromJSON(object.aggregateProperties)
        : undefined,
    };
  },

  toJSON(message: SystemSQLQuery_Aggregation): unknown {
    const obj: any = {};
    if (message.total !== undefined) {
      obj.total = SystemSQLQuery_Aggregation_Total.toJSON(message.total);
    }
    if (message.countUnique !== undefined) {
      obj.countUnique = SystemSQLQuery_Aggregation_CountUnique.toJSON(message.countUnique);
    }
    if (message.aggregateProperties !== undefined) {
      obj.aggregateProperties = SystemSQLQuery_Aggregation_AggregateProperties.toJSON(message.aggregateProperties);
    }
    return obj;
  },

  create(base?: DeepPartial<SystemSQLQuery_Aggregation>): SystemSQLQuery_Aggregation {
    return SystemSQLQuery_Aggregation.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SystemSQLQuery_Aggregation>): SystemSQLQuery_Aggregation {
    const message = createBaseSystemSQLQuery_Aggregation();
    message.total = (object.total !== undefined && object.total !== null)
      ? SystemSQLQuery_Aggregation_Total.fromPartial(object.total)
      : undefined;
    message.countUnique = (object.countUnique !== undefined && object.countUnique !== null)
      ? SystemSQLQuery_Aggregation_CountUnique.fromPartial(object.countUnique)
      : undefined;
    message.aggregateProperties = (object.aggregateProperties !== undefined && object.aggregateProperties !== null)
      ? SystemSQLQuery_Aggregation_AggregateProperties.fromPartial(object.aggregateProperties)
      : undefined;
    return message;
  },
};

function createBaseSystemSQLQuery_Aggregation_Total(): SystemSQLQuery_Aggregation_Total {
  return {};
}

export const SystemSQLQuery_Aggregation_Total = {
  encode(_: SystemSQLQuery_Aggregation_Total, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SystemSQLQuery_Aggregation_Total {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSystemSQLQuery_Aggregation_Total();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): SystemSQLQuery_Aggregation_Total {
    return {};
  },

  toJSON(_: SystemSQLQuery_Aggregation_Total): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<SystemSQLQuery_Aggregation_Total>): SystemSQLQuery_Aggregation_Total {
    return SystemSQLQuery_Aggregation_Total.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<SystemSQLQuery_Aggregation_Total>): SystemSQLQuery_Aggregation_Total {
    const message = createBaseSystemSQLQuery_Aggregation_Total();
    return message;
  },
};

function createBaseSystemSQLQuery_Aggregation_CountUnique(): SystemSQLQuery_Aggregation_CountUnique {
  return { duration: undefined };
}

export const SystemSQLQuery_Aggregation_CountUnique = {
  encode(message: SystemSQLQuery_Aggregation_CountUnique, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.duration !== undefined) {
      Duration.encode(message.duration, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SystemSQLQuery_Aggregation_CountUnique {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSystemSQLQuery_Aggregation_CountUnique();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.duration = Duration.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SystemSQLQuery_Aggregation_CountUnique {
    return { duration: isSet(object.duration) ? Duration.fromJSON(object.duration) : undefined };
  },

  toJSON(message: SystemSQLQuery_Aggregation_CountUnique): unknown {
    const obj: any = {};
    if (message.duration !== undefined) {
      obj.duration = Duration.toJSON(message.duration);
    }
    return obj;
  },

  create(base?: DeepPartial<SystemSQLQuery_Aggregation_CountUnique>): SystemSQLQuery_Aggregation_CountUnique {
    return SystemSQLQuery_Aggregation_CountUnique.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SystemSQLQuery_Aggregation_CountUnique>): SystemSQLQuery_Aggregation_CountUnique {
    const message = createBaseSystemSQLQuery_Aggregation_CountUnique();
    message.duration = (object.duration !== undefined && object.duration !== null)
      ? Duration.fromPartial(object.duration)
      : undefined;
    return message;
  },
};

function createBaseSystemSQLQuery_Aggregation_AggregateProperties(): SystemSQLQuery_Aggregation_AggregateProperties {
  return { type: 0, propertyName: "" };
}

export const SystemSQLQuery_Aggregation_AggregateProperties = {
  encode(
    message: SystemSQLQuery_Aggregation_AggregateProperties,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.propertyName !== "") {
      writer.uint32(18).string(message.propertyName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SystemSQLQuery_Aggregation_AggregateProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSystemSQLQuery_Aggregation_AggregateProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.propertyName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SystemSQLQuery_Aggregation_AggregateProperties {
    return {
      type: isSet(object.type)
        ? systemSQLQuery_Aggregation_AggregateProperties_AggregationTypeFromJSON(object.type)
        : 0,
      propertyName: isSet(object.propertyName) ? globalThis.String(object.propertyName) : "",
    };
  },

  toJSON(message: SystemSQLQuery_Aggregation_AggregateProperties): unknown {
    const obj: any = {};
    if (message.type !== 0) {
      obj.type = systemSQLQuery_Aggregation_AggregateProperties_AggregationTypeToJSON(message.type);
    }
    if (message.propertyName !== "") {
      obj.propertyName = message.propertyName;
    }
    return obj;
  },

  create(
    base?: DeepPartial<SystemSQLQuery_Aggregation_AggregateProperties>,
  ): SystemSQLQuery_Aggregation_AggregateProperties {
    return SystemSQLQuery_Aggregation_AggregateProperties.fromPartial(base ?? {});
  },
  fromPartial(
    object: DeepPartial<SystemSQLQuery_Aggregation_AggregateProperties>,
  ): SystemSQLQuery_Aggregation_AggregateProperties {
    const message = createBaseSystemSQLQuery_Aggregation_AggregateProperties();
    message.type = object.type ?? 0;
    message.propertyName = object.propertyName ?? "";
    return message;
  },
};

function createBaseNotification(): Notification {
  return {
    id: "",
    projectId: "",
    source: "",
    level: "",
    message: "",
    createdAt: undefined,
    type: 0,
    ownerId: "",
    owner: undefined,
    project: undefined,
    attributes: {},
    read: false,
    repeat: 0,
  };
}

export const Notification = {
  encode(message: Notification, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.projectId !== "") {
      writer.uint32(18).string(message.projectId);
    }
    if (message.source !== "") {
      writer.uint32(26).string(message.source);
    }
    if (message.level !== "") {
      writer.uint32(34).string(message.level);
    }
    if (message.message !== "") {
      writer.uint32(42).string(message.message);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.type !== 0) {
      writer.uint32(64).int32(message.type);
    }
    if (message.ownerId !== "") {
      writer.uint32(74).string(message.ownerId);
    }
    if (message.owner !== undefined) {
      Owner.encode(message.owner, writer.uint32(82).fork()).ldelim();
    }
    if (message.project !== undefined) {
      Project.encode(message.project, writer.uint32(90).fork()).ldelim();
    }
    Object.entries(message.attributes).forEach(([key, value]) => {
      Notification_AttributesEntry.encode({ key: key as any, value }, writer.uint32(98).fork()).ldelim();
    });
    if (message.read !== false) {
      writer.uint32(104).bool(message.read);
    }
    if (message.repeat !== 0) {
      writer.uint32(112).uint32(message.repeat);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Notification {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNotification();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.projectId = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.source = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.level = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.message = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.ownerId = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.owner = Owner.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.project = Project.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          const entry12 = Notification_AttributesEntry.decode(reader, reader.uint32());
          if (entry12.value !== undefined) {
            message.attributes[entry12.key] = entry12.value;
          }
          continue;
        case 13:
          if (tag !== 104) {
            break;
          }

          message.read = reader.bool();
          continue;
        case 14:
          if (tag !== 112) {
            break;
          }

          message.repeat = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Notification {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      projectId: isSet(object.projectId) ? globalThis.String(object.projectId) : "",
      source: isSet(object.source) ? globalThis.String(object.source) : "",
      level: isSet(object.level) ? globalThis.String(object.level) : "",
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      type: isSet(object.type) ? notificationTypeFromJSON(object.type) : 0,
      ownerId: isSet(object.ownerId) ? globalThis.String(object.ownerId) : "",
      owner: isSet(object.owner) ? Owner.fromJSON(object.owner) : undefined,
      project: isSet(object.project) ? Project.fromJSON(object.project) : undefined,
      attributes: isObject(object.attributes)
        ? Object.entries(object.attributes).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      read: isSet(object.read) ? globalThis.Boolean(object.read) : false,
      repeat: isSet(object.repeat) ? globalThis.Number(object.repeat) : 0,
    };
  },

  toJSON(message: Notification): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.projectId !== "") {
      obj.projectId = message.projectId;
    }
    if (message.source !== "") {
      obj.source = message.source;
    }
    if (message.level !== "") {
      obj.level = message.level;
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }
    if (message.type !== 0) {
      obj.type = notificationTypeToJSON(message.type);
    }
    if (message.ownerId !== "") {
      obj.ownerId = message.ownerId;
    }
    if (message.owner !== undefined) {
      obj.owner = Owner.toJSON(message.owner);
    }
    if (message.project !== undefined) {
      obj.project = Project.toJSON(message.project);
    }
    if (message.attributes) {
      const entries = Object.entries(message.attributes);
      if (entries.length > 0) {
        obj.attributes = {};
        entries.forEach(([k, v]) => {
          obj.attributes[k] = v;
        });
      }
    }
    if (message.read !== false) {
      obj.read = message.read;
    }
    if (message.repeat !== 0) {
      obj.repeat = Math.round(message.repeat);
    }
    return obj;
  },

  create(base?: DeepPartial<Notification>): Notification {
    return Notification.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Notification>): Notification {
    const message = createBaseNotification();
    message.id = object.id ?? "";
    message.projectId = object.projectId ?? "";
    message.source = object.source ?? "";
    message.level = object.level ?? "";
    message.message = object.message ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.type = object.type ?? 0;
    message.ownerId = object.ownerId ?? "";
    message.owner = (object.owner !== undefined && object.owner !== null) ? Owner.fromPartial(object.owner) : undefined;
    message.project = (object.project !== undefined && object.project !== null)
      ? Project.fromPartial(object.project)
      : undefined;
    message.attributes = Object.entries(object.attributes ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = globalThis.String(value);
        }
        return acc;
      },
      {},
    );
    message.read = object.read ?? false;
    message.repeat = object.repeat ?? 0;
    return message;
  },
};

function createBaseNotification_AttributesEntry(): Notification_AttributesEntry {
  return { key: "", value: "" };
}

export const Notification_AttributesEntry = {
  encode(message: Notification_AttributesEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Notification_AttributesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNotification_AttributesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Notification_AttributesEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: Notification_AttributesEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<Notification_AttributesEntry>): Notification_AttributesEntry {
    return Notification_AttributesEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Notification_AttributesEntry>): Notification_AttributesEntry {
    const message = createBaseNotification_AttributesEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseRichValue(): RichValue {
  return {
    nullValue: undefined,
    intValue: undefined,
    int64Value: undefined,
    floatValue: undefined,
    bytesValue: undefined,
    boolValue: undefined,
    stringValue: undefined,
    timestampValue: undefined,
    bigintValue: undefined,
    bigdecimalValue: undefined,
    listValue: undefined,
    structValue: undefined,
    tokenValue: undefined,
  };
}

export const RichValue = {
  encode(message: RichValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nullValue !== undefined) {
      writer.uint32(8).int32(message.nullValue);
    }
    if (message.intValue !== undefined) {
      writer.uint32(16).int32(message.intValue);
    }
    if (message.int64Value !== undefined) {
      if (BigInt.asIntN(64, message.int64Value) !== message.int64Value) {
        throw new globalThis.Error("value provided for field message.int64Value of type int64 too large");
      }
      writer.uint32(104).int64(message.int64Value.toString());
    }
    if (message.floatValue !== undefined) {
      writer.uint32(25).double(message.floatValue);
    }
    if (message.bytesValue !== undefined) {
      writer.uint32(34).bytes(message.bytesValue);
    }
    if (message.boolValue !== undefined) {
      writer.uint32(40).bool(message.boolValue);
    }
    if (message.stringValue !== undefined) {
      writer.uint32(50).string(message.stringValue);
    }
    if (message.timestampValue !== undefined) {
      Timestamp.encode(toTimestamp(message.timestampValue), writer.uint32(58).fork()).ldelim();
    }
    if (message.bigintValue !== undefined) {
      BigInteger.encode(message.bigintValue, writer.uint32(66).fork()).ldelim();
    }
    if (message.bigdecimalValue !== undefined) {
      BigDecimal.encode(message.bigdecimalValue, writer.uint32(74).fork()).ldelim();
    }
    if (message.listValue !== undefined) {
      RichValueList.encode(message.listValue, writer.uint32(82).fork()).ldelim();
    }
    if (message.structValue !== undefined) {
      RichStruct.encode(message.structValue, writer.uint32(90).fork()).ldelim();
    }
    if (message.tokenValue !== undefined) {
      TokenAmount.encode(message.tokenValue, writer.uint32(98).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RichValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRichValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.nullValue = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.intValue = reader.int32();
          continue;
        case 13:
          if (tag !== 104) {
            break;
          }

          message.int64Value = longToBigint(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.floatValue = reader.double();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.bytesValue = reader.bytes();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.boolValue = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.stringValue = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.timestampValue = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.bigintValue = BigInteger.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.bigdecimalValue = BigDecimal.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.listValue = RichValueList.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.structValue = RichStruct.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.tokenValue = TokenAmount.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RichValue {
    return {
      nullValue: isSet(object.nullValue) ? richValue_NullValueFromJSON(object.nullValue) : undefined,
      intValue: isSet(object.intValue) ? globalThis.Number(object.intValue) : undefined,
      int64Value: isSet(object.int64Value) ? BigInt(object.int64Value) : undefined,
      floatValue: isSet(object.floatValue) ? globalThis.Number(object.floatValue) : undefined,
      bytesValue: isSet(object.bytesValue) ? bytesFromBase64(object.bytesValue) : undefined,
      boolValue: isSet(object.boolValue) ? globalThis.Boolean(object.boolValue) : undefined,
      stringValue: isSet(object.stringValue) ? globalThis.String(object.stringValue) : undefined,
      timestampValue: isSet(object.timestampValue) ? fromJsonTimestamp(object.timestampValue) : undefined,
      bigintValue: isSet(object.bigintValue) ? BigInteger.fromJSON(object.bigintValue) : undefined,
      bigdecimalValue: isSet(object.bigdecimalValue) ? BigDecimal.fromJSON(object.bigdecimalValue) : undefined,
      listValue: isSet(object.listValue) ? RichValueList.fromJSON(object.listValue) : undefined,
      structValue: isSet(object.structValue) ? RichStruct.fromJSON(object.structValue) : undefined,
      tokenValue: isSet(object.tokenValue) ? TokenAmount.fromJSON(object.tokenValue) : undefined,
    };
  },

  toJSON(message: RichValue): unknown {
    const obj: any = {};
    if (message.nullValue !== undefined) {
      obj.nullValue = richValue_NullValueToJSON(message.nullValue);
    }
    if (message.intValue !== undefined) {
      obj.intValue = Math.round(message.intValue);
    }
    if (message.int64Value !== undefined) {
      obj.int64Value = message.int64Value.toString();
    }
    if (message.floatValue !== undefined) {
      obj.floatValue = message.floatValue;
    }
    if (message.bytesValue !== undefined) {
      obj.bytesValue = base64FromBytes(message.bytesValue);
    }
    if (message.boolValue !== undefined) {
      obj.boolValue = message.boolValue;
    }
    if (message.stringValue !== undefined) {
      obj.stringValue = message.stringValue;
    }
    if (message.timestampValue !== undefined) {
      obj.timestampValue = message.timestampValue.toISOString();
    }
    if (message.bigintValue !== undefined) {
      obj.bigintValue = BigInteger.toJSON(message.bigintValue);
    }
    if (message.bigdecimalValue !== undefined) {
      obj.bigdecimalValue = BigDecimal.toJSON(message.bigdecimalValue);
    }
    if (message.listValue !== undefined) {
      obj.listValue = RichValueList.toJSON(message.listValue);
    }
    if (message.structValue !== undefined) {
      obj.structValue = RichStruct.toJSON(message.structValue);
    }
    if (message.tokenValue !== undefined) {
      obj.tokenValue = TokenAmount.toJSON(message.tokenValue);
    }
    return obj;
  },

  create(base?: DeepPartial<RichValue>): RichValue {
    return RichValue.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RichValue>): RichValue {
    const message = createBaseRichValue();
    message.nullValue = object.nullValue ?? undefined;
    message.intValue = object.intValue ?? undefined;
    message.int64Value = object.int64Value ?? undefined;
    message.floatValue = object.floatValue ?? undefined;
    message.bytesValue = object.bytesValue ?? undefined;
    message.boolValue = object.boolValue ?? undefined;
    message.stringValue = object.stringValue ?? undefined;
    message.timestampValue = object.timestampValue ?? undefined;
    message.bigintValue = (object.bigintValue !== undefined && object.bigintValue !== null)
      ? BigInteger.fromPartial(object.bigintValue)
      : undefined;
    message.bigdecimalValue = (object.bigdecimalValue !== undefined && object.bigdecimalValue !== null)
      ? BigDecimal.fromPartial(object.bigdecimalValue)
      : undefined;
    message.listValue = (object.listValue !== undefined && object.listValue !== null)
      ? RichValueList.fromPartial(object.listValue)
      : undefined;
    message.structValue = (object.structValue !== undefined && object.structValue !== null)
      ? RichStruct.fromPartial(object.structValue)
      : undefined;
    message.tokenValue = (object.tokenValue !== undefined && object.tokenValue !== null)
      ? TokenAmount.fromPartial(object.tokenValue)
      : undefined;
    return message;
  },
};

function createBaseRichStruct(): RichStruct {
  return { fields: {} };
}

export const RichStruct = {
  encode(message: RichStruct, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.fields).forEach(([key, value]) => {
      RichStruct_FieldsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RichStruct {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRichStruct();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = RichStruct_FieldsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.fields[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RichStruct {
    return {
      fields: isObject(object.fields)
        ? Object.entries(object.fields).reduce<{ [key: string]: RichValue }>((acc, [key, value]) => {
          acc[key] = RichValue.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: RichStruct): unknown {
    const obj: any = {};
    if (message.fields) {
      const entries = Object.entries(message.fields);
      if (entries.length > 0) {
        obj.fields = {};
        entries.forEach(([k, v]) => {
          obj.fields[k] = RichValue.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<RichStruct>): RichStruct {
    return RichStruct.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RichStruct>): RichStruct {
    const message = createBaseRichStruct();
    message.fields = Object.entries(object.fields ?? {}).reduce<{ [key: string]: RichValue }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = RichValue.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseRichStruct_FieldsEntry(): RichStruct_FieldsEntry {
  return { key: "", value: undefined };
}

export const RichStruct_FieldsEntry = {
  encode(message: RichStruct_FieldsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      RichValue.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RichStruct_FieldsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRichStruct_FieldsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = RichValue.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RichStruct_FieldsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? RichValue.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: RichStruct_FieldsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = RichValue.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<RichStruct_FieldsEntry>): RichStruct_FieldsEntry {
    return RichStruct_FieldsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RichStruct_FieldsEntry>): RichStruct_FieldsEntry {
    const message = createBaseRichStruct_FieldsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? RichValue.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseRichValueList(): RichValueList {
  return { values: [] };
}

export const RichValueList = {
  encode(message: RichValueList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      RichValue.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RichValueList {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRichValueList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(RichValue.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RichValueList {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => RichValue.fromJSON(e)) : [],
    };
  },

  toJSON(message: RichValueList): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values.map((e) => RichValue.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<RichValueList>): RichValueList {
    return RichValueList.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RichValueList>): RichValueList {
    const message = createBaseRichValueList();
    message.values = object.values?.map((e) => RichValue.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRichStructList(): RichStructList {
  return { entities: [] };
}

export const RichStructList = {
  encode(message: RichStructList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.entities) {
      RichStruct.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RichStructList {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRichStructList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entities.push(RichStruct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RichStructList {
    return {
      entities: globalThis.Array.isArray(object?.entities)
        ? object.entities.map((e: any) => RichStruct.fromJSON(e))
        : [],
    };
  },

  toJSON(message: RichStructList): unknown {
    const obj: any = {};
    if (message.entities?.length) {
      obj.entities = message.entities.map((e) => RichStruct.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<RichStructList>): RichStructList {
    return RichStructList.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RichStructList>): RichStructList {
    const message = createBaseRichStructList();
    message.entities = object.entities?.map((e) => RichStruct.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBigDecimal(): BigDecimal {
  return { value: undefined, exp: 0 };
}

export const BigDecimal = {
  encode(message: BigDecimal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value !== undefined) {
      BigInteger.encode(message.value, writer.uint32(10).fork()).ldelim();
    }
    if (message.exp !== 0) {
      writer.uint32(16).int32(message.exp);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BigDecimal {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBigDecimal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value = BigInteger.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.exp = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BigDecimal {
    return {
      value: isSet(object.value) ? BigInteger.fromJSON(object.value) : undefined,
      exp: isSet(object.exp) ? globalThis.Number(object.exp) : 0,
    };
  },

  toJSON(message: BigDecimal): unknown {
    const obj: any = {};
    if (message.value !== undefined) {
      obj.value = BigInteger.toJSON(message.value);
    }
    if (message.exp !== 0) {
      obj.exp = Math.round(message.exp);
    }
    return obj;
  },

  create(base?: DeepPartial<BigDecimal>): BigDecimal {
    return BigDecimal.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BigDecimal>): BigDecimal {
    const message = createBaseBigDecimal();
    message.value = (object.value !== undefined && object.value !== null)
      ? BigInteger.fromPartial(object.value)
      : undefined;
    message.exp = object.exp ?? 0;
    return message;
  },
};

function createBaseBigInteger(): BigInteger {
  return { negative: false, data: new Uint8Array(0) };
}

export const BigInteger = {
  encode(message: BigInteger, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.negative !== false) {
      writer.uint32(8).bool(message.negative);
    }
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BigInteger {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBigInteger();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.negative = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.data = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BigInteger {
    return {
      negative: isSet(object.negative) ? globalThis.Boolean(object.negative) : false,
      data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array(0),
    };
  },

  toJSON(message: BigInteger): unknown {
    const obj: any = {};
    if (message.negative !== false) {
      obj.negative = message.negative;
    }
    if (message.data.length !== 0) {
      obj.data = base64FromBytes(message.data);
    }
    return obj;
  },

  create(base?: DeepPartial<BigInteger>): BigInteger {
    return BigInteger.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BigInteger>): BigInteger {
    const message = createBaseBigInteger();
    message.negative = object.negative ?? false;
    message.data = object.data ?? new Uint8Array(0);
    return message;
  },
};

function createBaseTokenAmount(): TokenAmount {
  return { token: undefined, amount: undefined, specifiedAt: undefined };
}

export const TokenAmount = {
  encode(message: TokenAmount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== undefined) {
      CoinID.encode(message.token, writer.uint32(10).fork()).ldelim();
    }
    if (message.amount !== undefined) {
      BigDecimal.encode(message.amount, writer.uint32(18).fork()).ldelim();
    }
    if (message.specifiedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.specifiedAt), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TokenAmount {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTokenAmount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.token = CoinID.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.amount = BigDecimal.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.specifiedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TokenAmount {
    return {
      token: isSet(object.token) ? CoinID.fromJSON(object.token) : undefined,
      amount: isSet(object.amount) ? BigDecimal.fromJSON(object.amount) : undefined,
      specifiedAt: isSet(object.specifiedAt) ? fromJsonTimestamp(object.specifiedAt) : undefined,
    };
  },

  toJSON(message: TokenAmount): unknown {
    const obj: any = {};
    if (message.token !== undefined) {
      obj.token = CoinID.toJSON(message.token);
    }
    if (message.amount !== undefined) {
      obj.amount = BigDecimal.toJSON(message.amount);
    }
    if (message.specifiedAt !== undefined) {
      obj.specifiedAt = message.specifiedAt.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<TokenAmount>): TokenAmount {
    return TokenAmount.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TokenAmount>): TokenAmount {
    const message = createBaseTokenAmount();
    message.token = (object.token !== undefined && object.token !== null)
      ? CoinID.fromPartial(object.token)
      : undefined;
    message.amount = (object.amount !== undefined && object.amount !== null)
      ? BigDecimal.fromPartial(object.amount)
      : undefined;
    message.specifiedAt = object.specifiedAt ?? undefined;
    return message;
  },
};

function createBaseRequestLog(): RequestLog {
  return {
    requestId: "",
    endpointId: "",
    owner: "",
    slug: "",
    statusCode: 0,
    error: "",
    requestBody: new Uint8Array(0),
    requestHeader: undefined,
    responseBody: new Uint8Array(0),
    responseHeader: undefined,
    createdAt: undefined,
    duration: BigInt("0"),
    queryDuration: BigInt("0"),
    method: "",
    rpcNodeId: "",
  };
}

export const RequestLog = {
  encode(message: RequestLog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.requestId !== "") {
      writer.uint32(10).string(message.requestId);
    }
    if (message.endpointId !== "") {
      writer.uint32(18).string(message.endpointId);
    }
    if (message.owner !== "") {
      writer.uint32(26).string(message.owner);
    }
    if (message.slug !== "") {
      writer.uint32(34).string(message.slug);
    }
    if (message.statusCode !== 0) {
      writer.uint32(40).uint32(message.statusCode);
    }
    if (message.error !== "") {
      writer.uint32(50).string(message.error);
    }
    if (message.requestBody.length !== 0) {
      writer.uint32(58).bytes(message.requestBody);
    }
    if (message.requestHeader !== undefined) {
      Struct.encode(Struct.wrap(message.requestHeader), writer.uint32(66).fork()).ldelim();
    }
    if (message.responseBody.length !== 0) {
      writer.uint32(74).bytes(message.responseBody);
    }
    if (message.responseHeader !== undefined) {
      Struct.encode(Struct.wrap(message.responseHeader), writer.uint32(82).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(90).fork()).ldelim();
    }
    if (message.duration !== BigInt("0")) {
      if (BigInt.asUintN(64, message.duration) !== message.duration) {
        throw new globalThis.Error("value provided for field message.duration of type uint64 too large");
      }
      writer.uint32(96).uint64(message.duration.toString());
    }
    if (message.queryDuration !== BigInt("0")) {
      if (BigInt.asUintN(64, message.queryDuration) !== message.queryDuration) {
        throw new globalThis.Error("value provided for field message.queryDuration of type uint64 too large");
      }
      writer.uint32(104).uint64(message.queryDuration.toString());
    }
    if (message.method !== "") {
      writer.uint32(114).string(message.method);
    }
    if (message.rpcNodeId !== "") {
      writer.uint32(122).string(message.rpcNodeId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestLog {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestLog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requestId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.endpointId = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.owner = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.statusCode = reader.uint32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.error = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.requestBody = reader.bytes();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.requestHeader = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.responseBody = reader.bytes();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.responseHeader = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.duration = longToBigint(reader.uint64() as Long);
          continue;
        case 13:
          if (tag !== 104) {
            break;
          }

          message.queryDuration = longToBigint(reader.uint64() as Long);
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.method = reader.string();
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.rpcNodeId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RequestLog {
    return {
      requestId: isSet(object.requestId) ? globalThis.String(object.requestId) : "",
      endpointId: isSet(object.endpointId) ? globalThis.String(object.endpointId) : "",
      owner: isSet(object.owner) ? globalThis.String(object.owner) : "",
      slug: isSet(object.slug) ? globalThis.String(object.slug) : "",
      statusCode: isSet(object.statusCode) ? globalThis.Number(object.statusCode) : 0,
      error: isSet(object.error) ? globalThis.String(object.error) : "",
      requestBody: isSet(object.requestBody) ? bytesFromBase64(object.requestBody) : new Uint8Array(0),
      requestHeader: isObject(object.requestHeader) ? object.requestHeader : undefined,
      responseBody: isSet(object.responseBody) ? bytesFromBase64(object.responseBody) : new Uint8Array(0),
      responseHeader: isObject(object.responseHeader) ? object.responseHeader : undefined,
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      duration: isSet(object.duration) ? BigInt(object.duration) : BigInt("0"),
      queryDuration: isSet(object.queryDuration) ? BigInt(object.queryDuration) : BigInt("0"),
      method: isSet(object.method) ? globalThis.String(object.method) : "",
      rpcNodeId: isSet(object.rpcNodeId) ? globalThis.String(object.rpcNodeId) : "",
    };
  },

  toJSON(message: RequestLog): unknown {
    const obj: any = {};
    if (message.requestId !== "") {
      obj.requestId = message.requestId;
    }
    if (message.endpointId !== "") {
      obj.endpointId = message.endpointId;
    }
    if (message.owner !== "") {
      obj.owner = message.owner;
    }
    if (message.slug !== "") {
      obj.slug = message.slug;
    }
    if (message.statusCode !== 0) {
      obj.statusCode = Math.round(message.statusCode);
    }
    if (message.error !== "") {
      obj.error = message.error;
    }
    if (message.requestBody.length !== 0) {
      obj.requestBody = base64FromBytes(message.requestBody);
    }
    if (message.requestHeader !== undefined) {
      obj.requestHeader = message.requestHeader;
    }
    if (message.responseBody.length !== 0) {
      obj.responseBody = base64FromBytes(message.responseBody);
    }
    if (message.responseHeader !== undefined) {
      obj.responseHeader = message.responseHeader;
    }
    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }
    if (message.duration !== BigInt("0")) {
      obj.duration = message.duration.toString();
    }
    if (message.queryDuration !== BigInt("0")) {
      obj.queryDuration = message.queryDuration.toString();
    }
    if (message.method !== "") {
      obj.method = message.method;
    }
    if (message.rpcNodeId !== "") {
      obj.rpcNodeId = message.rpcNodeId;
    }
    return obj;
  },

  create(base?: DeepPartial<RequestLog>): RequestLog {
    return RequestLog.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RequestLog>): RequestLog {
    const message = createBaseRequestLog();
    message.requestId = object.requestId ?? "";
    message.endpointId = object.endpointId ?? "";
    message.owner = object.owner ?? "";
    message.slug = object.slug ?? "";
    message.statusCode = object.statusCode ?? 0;
    message.error = object.error ?? "";
    message.requestBody = object.requestBody ?? new Uint8Array(0);
    message.requestHeader = object.requestHeader ?? undefined;
    message.responseBody = object.responseBody ?? new Uint8Array(0);
    message.responseHeader = object.responseHeader ?? undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.duration = object.duration ?? BigInt("0");
    message.queryDuration = object.queryDuration ?? BigInt("0");
    message.method = object.method ?? "";
    message.rpcNodeId = object.rpcNodeId ?? "";
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if ((globalThis as any).Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if ((globalThis as any).Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | bigint | undefined;

type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = BigInt(Math.trunc(date.getTime() / 1_000));
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (globalThis.Number(t.seconds.toString()) || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === "string") {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function longToBigint(long: Long) {
  return BigInt(long.toString());
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
