function calculateEndDate(startDate, period = "week") {
    const start = new Date(startDate);
    const end = new Date(start);

    if (period === "week") {
        end.setDate(start.getDate() + 6);
    } 
    // Nếu period là "day", endDate mặc định bằng startDate

    // Đặt giờ, phút, giây, ms về cuối ngày để bao gồm trọn vẹn ngày đó
    end.setHours(23, 59, 59, 999); 
    return end;
}

module.exports = {
    calculateEndDate,
};
