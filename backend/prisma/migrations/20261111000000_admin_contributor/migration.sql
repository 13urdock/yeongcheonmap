-- ERD v6: 운영진 역할 · 기록자(contributor) 분리 · 기록 경로(source) · 숨김 · 휴지통
-- 기존 기록은 "그 기록을 저장한 계정의 기록자"로 채운다 (지금은 전부 수집가).

-- 1) 계정 역할. 수집가·운영진 = admin (권한 같음), 그 밖 = member
ALTER TABLE "user" ADD COLUMN "role" VARCHAR(20) NOT NULL DEFAULT 'member';
UPDATE "user" SET "role" = 'admin' WHERE "user_id" = 'b0000000-0000-4000-8000-000000000001';

-- 2) 기록자
CREATE TABLE "contributor" (
    "contributor_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nickname" VARCHAR(50) NOT NULL,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributor_pkey" PRIMARY KEY ("contributor_id")
);
CREATE UNIQUE INDEX "contributor_user_id_key" ON "contributor"("user_id");
ALTER TABLE "contributor" ADD CONSTRAINT "contributor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) 기록자 연락처 (이벤트용, 지금은 비어 있음)
CREATE TABLE "contributor_contact" (
    "contributor_id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "consented_at" TIMESTAMPTZ NOT NULL,
    "retain_until" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributor_contact_pkey" PRIMARY KEY ("contributor_id")
);
CREATE UNIQUE INDEX "contributor_contact_phone_key" ON "contributor_contact"("phone");
ALTER TABLE "contributor_contact" ADD CONSTRAINT "contributor_contact_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("contributor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) 계정마다 기록자 1명 (수집가는 고정 ID — prisma/account-ids.ts 와 같아야 함)
INSERT INTO "contributor" ("contributor_id", "nickname", "user_id")
SELECT
    CASE WHEN u."user_id" = 'b0000000-0000-4000-8000-000000000001'
         THEN 'f0000000-0000-4000-8000-000000000001'::uuid
         ELSE gen_random_uuid() END,
    u."name",
    u."user_id"
FROM "user" u;

-- 5) 기록: 기록자 · 경로 · 숨김 · 휴지통
ALTER TABLE "story"
    ADD COLUMN "contributor_id" UUID,
    ADD COLUMN "source" VARCHAR(20) NOT NULL DEFAULT 'app',
    ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "deleted_at" TIMESTAMPTZ;

UPDATE "story" s SET "contributor_id" = c."contributor_id"
FROM "contributor" c
WHERE c."user_id" = s."user_id";

ALTER TABLE "story" ALTER COLUMN "contributor_id" SET NOT NULL;
CREATE INDEX "story_contributor_id_idx" ON "story"("contributor_id");
CREATE INDEX "story_created_at_idx" ON "story"("created_at");
ALTER TABLE "story" ADD CONSTRAINT "story_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("contributor_id") ON DELETE RESTRICT ON UPDATE CASCADE;
