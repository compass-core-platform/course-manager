const dbName = process.env.DATABASE_NAME;
const dbUserName = process.env.DATABASE_USERNAME;
const dbPassword = process.env.DATABASE_PASSWORD;
const dbPort = process.env.DATABASE_PORT;
const dbHost = '172.17.0.1';

export const copyViewQueries = [
    `CREATE EXTENSION IF NOT EXISTS postgres_fdw`,
    `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_foreign_server
                WHERE srvname = 'course_manager_server'
            ) THEN
                EXECUTE 'CREATE SERVER course_manager_server
                        FOREIGN DATA WRAPPER postgres_fdw
                        OPTIONS (host ''localhost'', dbname ''course-manager-db'', port ''5432'')';
            END IF;
        END $$;
    `,
    `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_user_mappings
                WHERE srvname = 'course_manager_server' AND usename = 'supercompass'
            ) THEN
                EXECUTE 'CREATE USER MAPPING FOR supercompass
                        SERVER course_manager_server
                        OPTIONS (user ''supercompass'', password ''tCzPKM47gE5ixVjn'')';
            END IF;
        END $$;
    `,
    `
        CREATE FOREIGN TABLE metrics_3cp_overall (
            "active3CPs" BIGINT,
            "pending3CPs" BIGINT,
            "rejected3CPs" BIGINT,
            "total3CPs" BIGINT
        )
        SERVER course_manager_server
        OPTIONS (schema_name 'public', table_name 'metrics_3cp_overall');
    `,
    `
        CREATE FOREIGN TABLE metrics_courses_overall (
            "activeCourses" bigint,
            "pendingCourses" bigint,
            "rejectedCourses" bigint,
            "totalCourses" bigint,
            "avgActiveCourseRating" double precision,
            "coursesCompleted" bigint,
            "coursesInProgress" bigint
        )
        SERVER course_manager_server
        OPTIONS (schema_name 'public', table_name 'metrics_courses_overall');
    `,
    `
        CREATE FOREIGN TABLE metrics_user_courses (
            "userId" text,
            "coursesRegisteredCount" bigint,
            "coursesInProgressCount" bigint,
            "coursesCompletedCount" bigint
        )
        SERVER course_manager_server
        OPTIONS (schema_name 'public', table_name 'metrics_user_courses');
    `,
    `
        CREATE FOREIGN TABLE user_courses_mapping (
            "userId" text,
            "courseId" text,
            "title" text,
            "status" text
        )
        SERVER course_manager_server
        OPTIONS (schema_name 'public', table_name 'user_courses_mapping');
    `,
    `
        CREATE FOREIGN TABLE telemetry_3cp_details (
            "3cpId" text,
            "name" text,
            "organizationName" text,
            "status" "ProviderStatus",
            "rejectionReason" text
        )
        SERVER course_manager_server
        OPTIONS (schema_name 'public', table_name 'telemetry_3cp_details');
    `,
    `
        CREATE FOREIGN TABLE telemetry_3cp_courses (
            "3cpId" text,
            "courseId" text,
            "courseName" text,
            "rating" double precision,
            "verificationStatus" text,
            "endUsersCount" bigint
        )
        SERVER course_manager_server
        OPTIONS (schema_name 'public', table_name 'telemetry_3cp_courses');   
    `,
];