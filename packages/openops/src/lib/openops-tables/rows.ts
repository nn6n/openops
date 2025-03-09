import {
  buildSimpleFilterUrlParam,
  FilterType,
  ViewFilterTypesEnum,
} from '../openops-tables/filters';
import {
  createAxiosHeaders,
  makeOpenOpsTablesDelete,
  makeOpenOpsTablesGet,
  makeOpenOpsTablesPatch,
  makeOpenOpsTablesPost,
} from '../openops-tables/requests-helpers';

export interface OpenOpsRow {
  id: number;
  order: string;
}

export interface RowParams {
  tableId: number;
  token: string;
}

export interface GetRowsParams extends RowParams {
  filters?: { fieldName: string; value: any; type: ViewFilterTypesEnum }[];
  filterType?: FilterType;
}

export interface AddRowParams extends RowParams {
  fields: { [key: string]: any };
}

export interface UpdateRowParams extends RowParams {
  fields: { [key: string]: any };
  rowId: number;
}

export interface DeleteRowParams extends RowParams {
  rowId: number;
}

export async function getRows(getRowsParams: GetRowsParams) {
  if (
    getRowsParams.filters &&
    getRowsParams.filters.length > 1 &&
    getRowsParams.filterType == null
  ) {
    throw new Error('Filter type must be provided when filters are provided');
  }

  const params = new URLSearchParams();

  params.append('user_field_names', `true`);
  getRowsParams.filters?.forEach((filter) => {
    params.append(
      `${buildSimpleFilterUrlParam(`${filter.fieldName}`, filter.type)}`,
      `${filter.value}`,
    );
  });
  if (getRowsParams.filterType) {
    params.append('filter_type', `${getRowsParams.filterType}`);
  }

  const paramsString = params.toString();
  const baseUrl = `api/database/rows/table/${getRowsParams.tableId}/`;
  const url = paramsString ? baseUrl + `?${paramsString}` : baseUrl;

  const authenticationHeader = createAxiosHeaders(getRowsParams.token);
  const getRowsResult = await makeOpenOpsTablesGet<{ results: any[] }[]>(
    url,
    authenticationHeader,
  );

  return getRowsResult.flatMap((row: any) => row.results);
}

export async function updateRow(updateRowParams: UpdateRowParams) {
  const authenticationHeader = createAxiosHeaders(updateRowParams.token);
  return await makeOpenOpsTablesPatch(
    `api/database/rows/table/${updateRowParams.tableId}/${updateRowParams.rowId}/?user_field_names=true`,
    updateRowParams.fields,
    authenticationHeader,
  );
}

export async function addRow(addRowParams: AddRowParams) {
  const authenticationHeader = createAxiosHeaders(addRowParams.token);
  return await makeOpenOpsTablesPost(
    `api/database/rows/table/${addRowParams.tableId}/?user_field_names=true`,
    addRowParams.fields,
    authenticationHeader,
  );
}

export async function deleteRow(deleteRowParams: DeleteRowParams) {
  const authenticationHeader = createAxiosHeaders(deleteRowParams.token);
  return await makeOpenOpsTablesDelete(
    `api/database/rows/table/${deleteRowParams.tableId}/${deleteRowParams.rowId}/`,
    authenticationHeader,
  );
}

export async function getRowByPrimaryKeyValue(
  token: string,
  tableId: number,
  primaryKeyFieldValue: string,
  primaryKeyFieldName: any,
) {
  const rows = await getRows({
    tableId: tableId,
    token: token,
    filters: [
      {
        fieldName: primaryKeyFieldName,
        value: primaryKeyFieldValue,
        type: ViewFilterTypesEnum.equal,
      },
    ],
  });

  if (rows.length > 1) {
    throw new Error('More than one row found with given primary key');
  }

  return rows[0];
}
