CREATE TABLE "project_applications" (
  "id" TEXT NOT NULL,
  "project_tender_id" TEXT NOT NULL,
  "applicant_id" TEXT NOT NULL,
  "company_name" TEXT NOT NULL,
  "contact_person" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "contact_phone" TEXT NOT NULL,
  "proposed_role" TEXT NOT NULL,
  "cover_message" TEXT NOT NULL,
  "supporting_document_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "withdrawn_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "project_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_application_events" (
  "id" TEXT NOT NULL,
  "application_id" TEXT NOT NULL,
  "actor_id" TEXT,
  "status" TEXT NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_application_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_applications_project_tender_id_applicant_id_key"
ON "project_applications"("project_tender_id", "applicant_id");
CREATE INDEX "project_applications_applicant_id_status_idx"
ON "project_applications"("applicant_id", "status");
CREATE INDEX "project_applications_project_tender_id_status_idx"
ON "project_applications"("project_tender_id", "status");
CREATE INDEX "project_application_events_application_id_created_at_idx"
ON "project_application_events"("application_id", "created_at");

ALTER TABLE "project_applications"
ADD CONSTRAINT "project_applications_project_tender_id_fkey"
FOREIGN KEY ("project_tender_id") REFERENCES "project_tenders"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_applications"
ADD CONSTRAINT "project_applications_applicant_id_fkey"
FOREIGN KEY ("applicant_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_application_events"
ADD CONSTRAINT "project_application_events_application_id_fkey"
FOREIGN KEY ("application_id") REFERENCES "project_applications"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_application_events"
ADD CONSTRAINT "project_application_events_actor_id_fkey"
FOREIGN KEY ("actor_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
