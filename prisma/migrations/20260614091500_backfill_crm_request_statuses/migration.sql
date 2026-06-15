-- Backfill unified CRM statuses from existing request-specific statuses.
UPDATE "TrainingBooking"
SET "crmStatus" = CASE
  WHEN "status" = 'booked' THEN 'BOOKED'::"CrmRequestStatus"
  WHEN "status" = 'cancelled' THEN 'CANCELLED'::"CrmRequestStatus"
  ELSE 'NEW'::"CrmRequestStatus"
END;

UPDATE "TeamApplication"
SET
  "crmStatus" = CASE
    WHEN "status" = 'PENDING' THEN 'NEW'::"CrmRequestStatus"
    WHEN "status" = 'IN_REVIEW' THEN 'IN_PROGRESS'::"CrmRequestStatus"
    WHEN "status" = 'ACCEPTED' THEN 'BOOKED'::"CrmRequestStatus"
    WHEN "status" = 'REJECTED' THEN 'REJECTED'::"CrmRequestStatus"
    WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"CrmRequestStatus"
    ELSE 'NEW'::"CrmRequestStatus"
  END,
  "managerNote" = COALESCE("managerNote", "internalNote"),
  "reviewedAt" = CASE
    WHEN "status" <> 'PENDING' THEN COALESCE("reviewedAt", "updatedAt")
    ELSE "reviewedAt"
  END;

UPDATE "RentalBooking"
SET
  "crmStatus" = CASE
    WHEN "status" = 'PENDING_CONFIRMATION' THEN 'NEW'::"CrmRequestStatus"
    WHEN "status" = 'CONFIRMED' THEN 'BOOKED'::"CrmRequestStatus"
    WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"CrmRequestStatus"
    ELSE 'NEW'::"CrmRequestStatus"
  END,
  "reviewedAt" = CASE
    WHEN "status" <> 'PENDING_CONFIRMATION' THEN COALESCE("reviewedAt", "updatedAt")
    ELSE "reviewedAt"
  END;
