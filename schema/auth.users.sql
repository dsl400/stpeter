
create SCHEMA if NOT EXISTS auth;


CREATE TABLE IF NOT EXISTS auth.users (
	id uuid PRIMARY KEY default gen_random_uuid(),
	tenant_id uuid NULL,
	"role" uuid default '00000000-0000-0000-0000-000000000000'::uuid,
	email varchar(255) NOT NULL UNIQUE,
	encrypted_password varchar(255) NULL,
	confirmed_at timestamptz NULL,
	invited_at timestamptz NULL,
	confirmation_token varchar(255) NULL,
	confirmation_sent_at timestamptz NULL,
	recovery_token varchar(255) NULL,
	recovery_sent_at timestamptz NULL,
	email_change_token varchar(255) NULL,
	email_change varchar(255) NULL,
	email_change_sent_at timestamptz NULL,
	email_confirmed_at timestamptz NULL,
	last_sign_in_at timestamptz NULL,
	app_claims jsonb NULL,
	user_claims jsonb NULL,
	is_super_admin bool NOT NULL DEFAULT false,
	created_at timestamptz NULL,
	updated_at timestamptz NULL
);

-- CREATE ROLE stpeter WITH LOGIN PASSWORD 'stpeterspassword';

GRANT SELECT, INSERT, UPDATE ON auth.users TO stpeter;