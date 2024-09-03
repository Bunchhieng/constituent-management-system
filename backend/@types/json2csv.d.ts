// backend/@types/json2csv.d.ts
declare module 'json2csv' {
    export class Parser {
        parse(data: any): string;
    }
}