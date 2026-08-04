-- =====================================================
-- DIAMOND TEAM - قاعدة بيانات نظام تقديم المنظمين
-- PostgreSQL / Supabase
-- =====================================================

-- 1. إنشاء جدول الطلبات (مع حذف الموجود إن وجد)
DROP TABLE IF EXISTS applications CASCADE;

CREATE TABLE applications (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "fullName"    TEXT NOT NULL CHECK (char_length(trim("fullName")) >= 6),
  phone         TEXT NOT NULL CHECK (phone ~ '^(05|06|07)[0-9]{8}$'),
  "idNumber"    TEXT NOT NULL CHECK (char_length(trim("idNumber")) >= 5),
  email         TEXT NOT NULL CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  photo         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  applications IS 'طلبات المتقدمين للانضمام لفريق DIAMOND TEAM';
COMMENT ON COLUMN applications."fullName" IS 'الاسم الثلاثي';
COMMENT ON COLUMN applications.phone IS 'رقم الهاتف (سعودي)';
COMMENT ON COLUMN applications."idNumber" IS 'رقم الهوية';
COMMENT ON COLUMN applications.email IS 'البريد الإلكتروني';
COMMENT ON COLUMN applications.photo IS 'الصورة الشخصية (Base64)';
COMMENT ON COLUMN applications.status IS 'حالة الطلب: pending, accepted, rejected';
COMMENT ON COLUMN applications.notes IS 'ملاحظات الإدارة';
COMMENT ON COLUMN applications.created_at IS 'تاريخ التقديم';
COMMENT ON COLUMN applications.updated_at IS 'آخر تحديث';

-- 2. الفهارس (Indexes) لتسريع البحث والتصفية
CREATE INDEX idx_applications_status     ON applications (status);
CREATE INDEX idx_applications_created_at ON applications (created_at DESC);
CREATE INDEX idx_applications_phone      ON applications (phone);
CREATE INDEX idx_applications_fullname   ON applications ("fullName" text_pattern_ops);
CREATE INDEX idx_applications_email      ON applications (email);

-- 3. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. trigger لتحديث updated_at عند أي تعديل
DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. تفعيل Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 6. سياسات RLS

-- 6.1 السماح للجميع (anon) بإدراج طلب جديد
CREATE POLICY "allow_insert_anon"
  ON applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 6.2 السماح للجميع (anon) بقراءة الطلبات
-- (لأن dashboard.html يستخدم anon key ولا يوجد Auth حقيقي)
-- يمكن تعطيل هذه السياسة لاحقاً عند تفعيل Supabase Auth
CREATE POLICY "allow_select_anon"
  ON applications
  FOR SELECT
  TO anon
  USING (true);

-- 6.3 السماح للجميع (anon) بتحديث الطلبات (تغيير الحالة)
CREATE POLICY "allow_update_anon"
  ON applications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 6.4 السماح للجميع (anon) بحذف الطلبات
CREATE POLICY "allow_delete_anon"
  ON applications
  FOR DELETE
  TO anon
  USING (true);

-- 7. صلاحيات الأدوار
GRANT ALL ON applications TO anon;
GRANT ALL ON applications TO authenticated;
GRANT ALL ON applications TO service_role;

GRANT USAGE ON SEQUENCE applications_id_seq TO anon;
GRANT USAGE ON SEQUENCE applications_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE applications_id_seq TO service_role;

-- =====================================================
-- 8. (اختياري) جدول سجل الإجراءات لتوثيق التعديلات
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  app_id      BIGINT REFERENCES applications(id) ON DELETE CASCADE,
  action      TEXT NOT NULL CHECK (action IN ('created', 'accepted', 'rejected', 'deleted', 'note_added')),
  old_status  TEXT,
  new_status  TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  audit_log IS 'سجل الإجراءات على الطلبات';
COMMENT ON COLUMN audit_log.action IS 'نوع الإجراء';
COMMENT ON COLUMN audit_log.old_status IS 'الحالة القديمة';
COMMENT ON COLUMN audit_log.new_status IS 'الحالة الجديدة';

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_audit_anon"   ON audit_log FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_select_audit_anon"   ON audit_log FOR SELECT TO anon USING (true);
GRANT ALL ON audit_log TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE audit_log_id_seq TO anon, authenticated, service_role;

-- =====================================================
-- 9. (اختياري) إضافة عينة بيانات للتجربة
-- =====================================================
INSERT INTO applications ("fullName", phone, "idNumber", email, status) VALUES
  ('أحمد محمد علي', '0551234567', '1098765432', 'ahmed@example.com', 'pending'),
  ('سارة خالد عبدالله', '0569876543', '1076543210', 'sara@example.com', 'accepted'),
  ('فهد ناصر التميمي', '0591122334', '1087654321', 'fahad@example.com', 'rejected'),
  ('نورة عبدالعزيز', '0544567890', '1065432198', 'noura@example.com', 'pending'),
  ('عمر حسن الزهراني', '0582233445', '1043219876', 'omar@example.com', 'accepted');
