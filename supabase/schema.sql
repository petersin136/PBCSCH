-- =============================================================================
-- 포천중앙침례교회 주일학교 — 성경읽기(Bible Reading) Supabase 스키마
-- =============================================================================
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 그대로 붙여넣고 Run.
-- 두 번 이상 실행해도 안전(idempotent)하도록 작성되어 있습니다.
-- =============================================================================

-- crypt() / gen_salt() 사용을 위해 pgcrypto 확장 활성화
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1) 반(Class)
-- -----------------------------------------------------------------------------
create table if not exists public.br_classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2) 학생(Student)
--    pin_hash 는 bcrypt 해시. 클라이언트에는 절대 노출하지 않는다.
-- -----------------------------------------------------------------------------
create table if not exists public.br_students (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.br_classes(id) on delete cascade,
  name        text not null,
  pin_hash    text,
  created_at  timestamptz not null default now()
);

create index if not exists br_students_class_idx on public.br_students(class_id);

-- -----------------------------------------------------------------------------
-- 3) 읽기 기록(Reading Log)
--    student_id + book + chapter 가 유일 → 같은 장 두 번 기록되지 않음.
-- -----------------------------------------------------------------------------
create table if not exists public.br_reading_logs (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.br_students(id) on delete cascade,
  class_id      uuid not null references public.br_classes(id) on delete cascade,
  book          text not null check (
    book in ('proverbs','matthew','mark','luke','john')
  ),
  chapter       integer not null check (chapter >= 1),
  translation   text not null check (translation in ('krv','kids')),
  completed_at  timestamptz not null default now(),
  unique (student_id, book, chapter)
);

create index if not exists br_reading_logs_student_book_idx
  on public.br_reading_logs(student_id, book);

-- -----------------------------------------------------------------------------
-- 4) RPC: 학생이 PIN을 이미 설정했는지 확인
-- -----------------------------------------------------------------------------
create or replace function public.br_student_has_pin(p_student_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.br_students
    where id = p_student_id and pin_hash is not null
  );
$$;

-- -----------------------------------------------------------------------------
-- 5) RPC: 학생 PIN 최초 설정 (이미 설정되어 있으면 false 반환)
-- -----------------------------------------------------------------------------
create or replace function public.br_set_student_pin(
  p_student_id uuid,
  p_pin        text
) returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  existing text;
begin
  -- PIN 형식 가드: 숫자 4자리만 허용
  if p_pin is null or p_pin !~ '^\d{4}$' then
    return false;
  end if;

  select pin_hash into existing
    from public.br_students
    where id = p_student_id;

  if existing is not null then
    return false;
  end if;

  update public.br_students
    set pin_hash = crypt(p_pin, gen_salt('bf'))
    where id = p_student_id;

  return true;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6) RPC: 학생 PIN 검증
-- -----------------------------------------------------------------------------
create or replace function public.br_verify_student(
  p_student_id uuid,
  p_pin        text
) returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored text;
begin
  if p_pin is null then
    return false;
  end if;

  select pin_hash into stored
    from public.br_students
    where id = p_student_id;

  if stored is null then
    return false;
  end if;

  return stored = crypt(p_pin, stored);
end;
$$;

-- -----------------------------------------------------------------------------
-- 7) 권한 / RLS
--    - 클라이언트(anon)는 br_students 의 pin_hash 컬럼은 못 본다.
--    - RPC 함수들만이 pin_hash 를 다룬다(security definer).
-- -----------------------------------------------------------------------------
alter table public.br_classes        enable row level security;
alter table public.br_students       enable row level security;
alter table public.br_reading_logs   enable row level security;

-- 컬럼 권한 분리: anon/authenticated 는 pin_hash 를 select 할 수 없게 한다.
revoke all on public.br_students from anon, authenticated;
grant  select (id, class_id, name) on public.br_students to anon, authenticated;
grant  insert (class_id, name)     on public.br_students to authenticated;

-- 학생 추가/삭제는 selvice_role(서버측 도구)에서만 한다고 가정하고,
-- 일반 클라이언트는 select 만 허용.
drop policy if exists "br_classes_read"      on public.br_classes;
drop policy if exists "br_students_read"     on public.br_students;
drop policy if exists "br_reading_logs_read" on public.br_reading_logs;
drop policy if exists "br_reading_logs_ins"  on public.br_reading_logs;
drop policy if exists "br_reading_logs_upd"  on public.br_reading_logs;

create policy "br_classes_read"
  on public.br_classes for select
  using (true);

create policy "br_students_read"
  on public.br_students for select
  using (true);

create policy "br_reading_logs_read"
  on public.br_reading_logs for select
  using (true);

-- 진도 기록은 누구나 추가/갱신할 수 있다(아동 앱 + PIN 검증으로 student 식별).
-- 더 엄격하게 묶고 싶으면 학생 PIN 세션 토큰을 만들어 RLS 에 endpoint 를 거는 식으로
-- 발전시킬 수 있지만, 현재 구조에서는 단순 허용으로 둔다.
create policy "br_reading_logs_ins"
  on public.br_reading_logs for insert
  with check (true);

create policy "br_reading_logs_upd"
  on public.br_reading_logs for update
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- 8) 시드 데이터(선택)  ─ 처음 한 번만 채워넣으면 됨.
--    필요 없으면 주석 처리.
-- -----------------------------------------------------------------------------
-- insert into public.br_classes (name) values
--   ('1학년'), ('2학년'), ('3학년'), ('4학년'), ('5학년'), ('6학년')
-- on conflict do nothing;

-- 학생은 선생님이 대시보드에서 직접 추가하거나, 별도 SQL 로 insert 하세요:
--   insert into public.br_students (class_id, name) values
--     ((select id from public.br_classes where name = '1학년'), '홍길동');
