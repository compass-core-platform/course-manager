

export class FeedbackResponseDto {

    // number of consumers that have purchased the course
    readonly numberOfPurchases: number

    // list of consumer feedbacks and their ratings
    readonly feedbacks: Feedback[]
}

export interface Feedback {

    //  Feedback Text
    feedback: string,

    //  Integer rating of the course
    rating: number
}