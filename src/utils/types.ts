
export type CompetencyMap = Record<string, string[]>;

export type PaymentInfo = {
    bankName: string;
    branch: string;
    accountNumber: string;
    IFSCCode: string;
    PANnumber: string;
    GSTNumber: string;
}