-- CreateTable
CREATE TABLE "user" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "user_id" UUID NOT NULL,
    "profile_url" VARCHAR(500),
    "bio" VARCHAR(255),

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "session" (
    "session_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "place" (
    "place_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "usage_type" VARCHAR(100),
    "intro" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" VARCHAR(255),
    "since_year" INTEGER,
    "thumbnail_url" VARCHAR(500),
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "story" (
    "story_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "place_id" UUID,
    "event_id" UUID,
    "user_id" UUID NOT NULL,
    "memory_date" CHAR(10) NOT NULL DEFAULT 'XXXX.XX.XX',
    "memory_date_from" DATE NOT NULL,
    "memory_date_to" DATE NOT NULL,
    "memory_year_from" INTEGER NOT NULL,
    "memory_year_to" INTEGER NOT NULL,
    "memory_year_unknown" BOOLEAN NOT NULL,
    "place_name_then" VARCHAR(150),
    "content" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_pkey" PRIMARY KEY ("story_id")
);

-- CreateTable
CREATE TABLE "story_photo" (
    "story_photo_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "story_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_photo_pkey" PRIMARY KEY ("story_photo_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "content" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "event_host" (
    "event_host_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "host_type" VARCHAR(50) NOT NULL,
    "host_name" VARCHAR(150) NOT NULL,

    CONSTRAINT "event_host_pkey" PRIMARY KEY ("event_host_id")
);

-- CreateTable
CREATE TABLE "event_photo" (
    "event_photo_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_photo_pkey" PRIMARY KEY ("event_photo_id")
);

-- CreateTable
CREATE TABLE "event_occurrence" (
    "occurrence_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "event_occurrence_pkey" PRIMARY KEY ("occurrence_id")
);

-- CreateTable
CREATE TABLE "event_place" (
    "occurrence_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,

    CONSTRAINT "event_place_pkey" PRIMARY KEY ("occurrence_id","place_id")
);

-- CreateTable
CREATE TABLE "metric_type" (
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "metric_type_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "user_metric" (
    "user_id" UUID NOT NULL,
    "metric_code" VARCHAR(50) NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_metric_pkey" PRIMARY KEY ("user_id","metric_code")
);

-- CreateTable
CREATE TABLE "achv" (
    "achv_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "achv_name" VARCHAR(100) NOT NULL,
    "tier" VARCHAR(20) NOT NULL,
    "metric_code" VARCHAR(50) NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "achv_pkey" PRIMARY KEY ("achv_id")
);

-- CreateTable
CREATE TABLE "user_achv" (
    "user_id" UUID NOT NULL,
    "achv_id" UUID NOT NULL,
    "achieved_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achv_pkey" PRIMARY KEY ("user_id","achv_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "place_latitude_longitude_idx" ON "place"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "story_place_timeline_idx" ON "story"("place_id", "memory_year_unknown", "memory_year_from", "memory_year_to", "memory_date_from", "memory_date_to");

-- CreateIndex
CREATE INDEX "story_event_timeline_idx" ON "story"("event_id", "memory_year_unknown", "memory_year_from", "memory_year_to", "memory_date_from", "memory_date_to");

-- CreateIndex
CREATE INDEX "story_user_id_idx" ON "story"("user_id");

-- CreateIndex
CREATE INDEX "story_photo_story_id_idx" ON "story_photo"("story_id");

-- CreateIndex
CREATE INDEX "event_host_event_id_idx" ON "event_host"("event_id");

-- CreateIndex
CREATE INDEX "event_photo_event_id_idx" ON "event_photo"("event_id");

-- CreateIndex
CREATE INDEX "event_occurrence_event_id_idx" ON "event_occurrence"("event_id");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_photo" ADD CONSTRAINT "story_photo_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "story"("story_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_host" ADD CONSTRAINT "event_host_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_photo" ADD CONSTRAINT "event_photo_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_occurrence" ADD CONSTRAINT "event_occurrence_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_place" ADD CONSTRAINT "event_place_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "event_occurrence"("occurrence_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_place" ADD CONSTRAINT "event_place_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_metric" ADD CONSTRAINT "user_metric_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_metric" ADD CONSTRAINT "user_metric_metric_code_fkey" FOREIGN KEY ("metric_code") REFERENCES "metric_type"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achv" ADD CONSTRAINT "achv_metric_code_fkey" FOREIGN KEY ("metric_code") REFERENCES "metric_type"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achv" ADD CONSTRAINT "user_achv_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achv" ADD CONSTRAINT "user_achv_achv_id_fkey" FOREIGN KEY ("achv_id") REFERENCES "achv"("achv_id") ON DELETE RESTRICT ON UPDATE CASCADE;
