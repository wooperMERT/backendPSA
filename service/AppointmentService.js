const { fetchAllAppointmentData } = require('../firebase/firebaseMethods');

const updateAppointments = async (currentDateTime) => {
    const appointments = fetchAllAppointmentData();

    // Calculate the date that is 6 hours before the currentDateTime
    const cutoffTime = new Date(currentDateTime.getTime() - 6 * 60 * 60 * 1000);

    // Filter out appointments that are older than 6 hours before currentDateTime
    const updatedAppointments = appointments.filter(appointment => {
        const appointmentDateTime = appointment.dateTime.toDate(); // Convert Firestore Timestamp to JS Date
        return appointmentDateTime > cutoffTime;
    });

    return updatedAppointments; // These are the appointments that are still valid
}

module.exports = {updateAppointments};

