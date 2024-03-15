import { Table } from "sst/node/table";
import Dinamo from "dinamo";

export const dinamo = new Dinamo({
	tableName: Table.table.tableName,
});
