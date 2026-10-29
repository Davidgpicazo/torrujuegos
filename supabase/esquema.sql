-- =========================================================================
-- Torrujuegos — esquema de Supabase para sincronizar familias
--
-- Cómo usarlo: en tu proyecto de Supabase, abre "SQL Editor", pega todo este
-- archivo y pulsa "Run". Se puede ejecutar más de una vez sin problema.
--
-- Seguridad:
--  * La tabla tiene RLS activado y SIN políticas: nadie puede leerla ni listarla
--    directamente con la clave pública.
--  * Solo se accede mediante 3 funciones, y siempre conociendo el código de familia.
--  * En la tabla se guarda el hash SHA-256 del código, no el código: aunque alguien
--    viera la tabla, no podría usar esos datos para entrar desde el juego.
-- =========================================================================

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.familias (
  codigo_hash  text primary key,
  datos        jsonb       not null,
  version      integer     not null default 1,
  creado       timestamptz not null default now(),
  actualizado  timestamptz not null default now()
);

alter table public.familias enable row level security;
revoke all on table public.familias from anon, authenticated;

-- Hash del código (normalizado en el juego como TJ-XXXXX-XXXXX-XXXXX)
create or replace function public._hash_codigo(p_codigo text)
returns text language sql immutable
set search_path = public, extensions
as $$ select encode(extensions.digest(p_codigo, 'sha256'), 'hex') $$;

-- Leer los datos de una familia (null si el código no existe)
create or replace function public.obtener_familia(p_codigo text)
returns jsonb language sql stable security definer
set search_path = public, extensions
as $$
  select jsonb_build_object('datos', f.datos, 'version', f.version)
  from public.familias f
  where f.codigo_hash = public._hash_codigo(p_codigo);
$$;

-- Guardar con control de versión: si otro dispositivo guardó antes, devuelve
-- ok=false con los datos actuales para que el juego los fusione y reintente.
create or replace function public.guardar_familia(p_codigo text, p_datos jsonb, p_version integer)
returns jsonb language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_hash text := public._hash_codigo(p_codigo);
  v_fila public.familias%rowtype;
begin
  if p_codigo !~ '^TJ-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$' then
    raise exception 'Código no válido';
  end if;
  if pg_column_size(p_datos) > 400000 then
    raise exception 'Datos demasiado grandes';
  end if;

  select * into v_fila from public.familias where codigo_hash = v_hash for update;

  if not found then
    insert into public.familias (codigo_hash, datos, version) values (v_hash, p_datos, 1);
    return jsonb_build_object('ok', true, 'version', 1);
  end if;

  if v_fila.version <> p_version then
    return jsonb_build_object('ok', false, 'version', v_fila.version, 'datos', v_fila.datos);
  end if;

  update public.familias
     set datos = p_datos, version = v_fila.version + 1, actualizado = now()
   where codigo_hash = v_hash;
  return jsonb_build_object('ok', true, 'version', v_fila.version + 1);
end;
$$;

-- Borrar todos los datos de una familia (derecho de supresión, desde Padres → Familia)
create or replace function public.borrar_familia(p_codigo text)
returns boolean language sql security definer
set search_path = public, extensions
as $$
  with borradas as (delete from public.familias where codigo_hash = public._hash_codigo(p_codigo) returning 1)
  select exists(select 1 from borradas);
$$;

revoke all on function public.obtener_familia(text) from public;
revoke all on function public.guardar_familia(text, jsonb, integer) from public;
revoke all on function public.borrar_familia(text) from public;
grant execute on function public.obtener_familia(text) to anon, authenticated;
grant execute on function public.guardar_familia(text, jsonb, integer) to anon, authenticated;
grant execute on function public.borrar_familia(text) to anon, authenticated;
