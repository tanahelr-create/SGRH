                                         Table "public.users"
    Column     |            Type             | Collation | Nullable |              Default              
---------------+-----------------------------+-----------+----------+-----------------------------------
 id            | integer                     |           | not null | nextval('users_id_seq'::regclass)
 email         | character varying(150)      |           |          | 
 password_hash | character varying(255)      |           | not null | 
 role          | character varying(20)       |           | not null | 
 status        | character varying(20)       |           | not null | 'active'::character varying
 created_at    | timestamp without time zone |           | not null | now()
 personnel_id  | integer                     |           |          | 
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "users_email_key" UNIQUE CONSTRAINT, btree (email)
    "users_personnel_id_key" UNIQUE CONSTRAINT, btree (personnel_id)
Check constraints:
    "users_role_check" CHECK (role::text = ANY (ARRAY['SUPERADMIN'::character varying, 'ADMIN_RH'::character varying, 'PE'::character varying, 'PAT'::character varying, 'MESUPRES'::character varying]::text[]))
    "users_status_check" CHECK (status::text = ANY (ARRAY['pending'::character v:


                                     Table "public.permissions"
  Column  |          Type          | Collation | Nullable |                 Default                 
----------+------------------------+-----------+----------+-----------------------------------------
 id       | integer                |           | not null | nextval('permissions_id_seq'::regclass)
 key      | character varying(100) |           | not null | 
 label    | character varying(150) |           | not null | 
 category | character varying(50)  |           | not null | 
Indexes:
    "permissions_pkey" PRIMARY KEY, btree (id)
    "permissions_key_key" UNIQUE CONSTRAINT, btree (key)
Referenced by:
    TABLE "role_permissions" CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES permissions(id)



                                       Table "public.role_permissions"
    Column     |         Type          | Collation | Nullable |                   Default                    
---------------+-----------------------+-----------+----------+----------------------------------------------
 id            | integer               |           | not null | nextval('role_permissions_id_seq'::regclass)
 role          | character varying(20) |           | not null | 
 permission_id | integer               |           | not null | 
 enabled       | boolean               |           | not null | true
Indexes:
    "role_permissions_pkey" PRIMARY KEY, btree (id)
    "role_permissions_role_permission_id_key" UNIQUE CONSTRAINT, btree (role, permission_id)
Foreign-key constraints:
    "role_permissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES permissions(id)

(END)

                                            Table "public.fonction_history"
      Column       |            Type             | Collation | Nullable |                   Default                    
-------------------+-----------------------------+-----------+----------+----------------------------------------------
 id                | integer                     |           | not null | nextval('fonction_history_id_seq'::regclass)
 user_id           | integer                     |           | not null | 
 ancienne_fonction | character varying(50)       |           |          | 
 nouvelle_fonction | character varying(50)       |           | not null | 
 changed_by        | integer                     |           |          | 
 changed_at        | timestamp without time zone |           | not null | now()
Indexes:
    "fonction_history_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "fonction_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES users(id)
    "fonction_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)



