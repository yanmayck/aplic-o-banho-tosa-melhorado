export declare enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare class CreateAppointmentDto {
    petId: string;
    serviceTypeId: string;
    appointmentDateTime: string;
    notes?: string;
}
