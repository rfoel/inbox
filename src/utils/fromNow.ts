import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const fromNow = (date: number) => {
	if (!dayjs().isSame(date, "year")) {
		return dayjs(date).format("DD/MM/YYYY");
	}

	if (dayjs().diff(date, "days") > 7) {
		return dayjs(date).format("ddd DD/MM");
	}

	if (dayjs().diff(date, "days") > 1) {
		return dayjs(date).format("ddd HH:mm");
	}

	return dayjs(date).format("HH:mm");
};
