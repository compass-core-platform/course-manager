

export class CourseTransactionDto {

    // course ID
    readonly courseId: string;

    // course name
    readonly courseName: string;

    // timestamp for when the course availability starts
    readonly startDate: Date | null;

    // timestamp for when the course availability ends
    readonly endDate: Date | null;

    // Credit cost of course
    readonly credits: number;

    // Number of enrolled consumers
    readonly numConsumersEnrolled: number;

    // Total income from course
    readonly income: number;
}

