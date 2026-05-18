// export function getParamsEncodedQuery(params: IParams) {
//   const nonEmptyParams: IParams = {};

//   for (const [key, value] of Object.entries(params)) {
//     const emptyArray = Array.isArray(value) && value?.length === 0;

//     if (value === undefined || value === null || value === "" || emptyArray) {
//       continue;
//     } else {
//       nonEmptyParams[key] = value;
//     }
//   }

//   return QueryString.stringify(nonEmptyParams, {
//     arrayFormat: "indices",
//     indices: true,
//   });
// }
