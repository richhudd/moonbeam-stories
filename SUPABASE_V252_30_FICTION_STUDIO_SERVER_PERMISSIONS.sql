-- V252.30 — Fiction Studio server permissions fix.
-- Browser roles remain revoked. Only the server-side service_role receives table privileges.
grant select, insert, update, delete on table public.developer_fiction_series to service_role;
