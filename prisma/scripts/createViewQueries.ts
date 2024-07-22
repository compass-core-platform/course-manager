export const createViewQueries = [
    `
        DROP VIEW IF EXISTS metrics_3cp_overall;
    `,
    `
        DROP VIEW IF EXISTS metrics_courses_overall
    `,
    `
        DROP VIEW IF EXISTS metrics_user_courses
    `,
    `
        DROP VIEW IF EXISTS user_courses_mapping
    `,
    `
        DROP VIEW IF EXISTS telemetry_3cp_details
    `,
    `
        DROP VIEW IF EXISTS telemetry_3cp_courses
    `,
    `
        CREATE VIEW metrics_3cp_overall AS
        SELECT 
            (SELECT COUNT(*) FROM "Provider" WHERE status = 'VERIFIED') AS "active3CPs",
            (SELECT COUNT(*) FROM "Provider" WHERE status = 'PENDING') AS "pending3CPs",
            (SELECT COUNT(*) FROM "Provider" WHERE status = 'REJECTED') AS "rejected3CPs",
            (SELECT COUNT(*) FROM "Provider") AS "total3CPs"
    `,

    `
        CREATE VIEW metrics_courses_overall AS
        SELECT 
            (SELECT COUNT(*) FROM "Course" WHERE "verificationStatus" = 'ACCEPTED') AS "activeCourses",
            (SELECT COUNT(*) FROM "Course" WHERE "verificationStatus" = 'PENDING') AS "pendingCourses",
            (SELECT COUNT(*) FROM "Course" WHERE "verificationStatus" = 'REJECTED') AS "rejectedCourses",
            (SELECT COUNT(*) FROM "Course") AS "totalCourses",
            (SELECT SUM("avgRating")/ COUNT(*) FROM "Course" WHERE "avgRating" > 0) AS "avgActiveCourseRating",
            (SELECT COUNT(*) FROM "UserCourse" WHERE status = 'COMPLETED') AS "coursesCompleted",
            (SELECT COUNT(*) FROM "UserCourse" WHERE status = 'IN_PROGRESS') AS "coursesInProgress"
    `,            

    `
        CREATE VIEW metrics_user_courses AS
        SELECT 
            uc."userId",
            COUNT(DISTINCT uc."courseId") AS "coursesRegisteredCount",
            COUNT(*) FILTER (WHERE uc.status = 'IN_PROGRESS') AS "coursesInProgressCount",
            COUNT(*) FILTER (WHERE uc.status = 'COMPLETED') AS "coursesCompletedCount"
        FROM 
            "UserCourse" uc
        GROUP BY 
            uc."userId"
    `,
    `
        CREATE VIEW user_courses_mapping AS
        SELECT 
            uc."userId",
            c."courseId",
            c.title,
            uc.status
        FROM 
            "UserCourse" uc
        JOIN 
            "Course" c ON uc."courseId" = c."courseId"
        GROUP BY 
            uc."userId", c."courseId", uc.status
    `,
    `
        CREATE VIEW telemetry_3cp_details AS
        SELECT 
            p.id AS "3cpId",
            p.name,
            p."orgName" AS "organizationName",
            p.status,
            p."rejectionReason"
        FROM 
            "Provider" p 
        GROUP BY
            p.id, p.name
    `,
    `
        CREATE VIEW telemetry_3cp_courses AS
        SELECT
            c."providerId" AS "3cpId",
            c."courseId",
            c.title AS "courseName",
            c."avgRating" AS rating,
            c."verificationStatus",
            COUNT(DISTINCT uc."userId") AS "endUsersCount"
        FROM 
            "Course" c
        LEFT JOIN
            "UserCourse" uc ON c."courseId" = uc."courseId"
        GROUP BY
            c."courseId", c.title
    `
];