import { useState, useCallback } from 'react'
import Papa from 'papaparse'

// 기본 필드를 정의
interface BaseRow {
 [key: string]: string | undefined;
}

// 확장된 RowData 인터페이스
interface RowData extends BaseRow {
 LLM_Eval: string;
 Human_Eval: string;
 is_augmented?: string;
}

interface ColumnType {
 type: 'text' | 'dropdown';
 scoreRange?: number;
}

export function useCSVData() {
 const [data, setData] = useState<RowData[]>([])
 const [headers, setHeaders] = useState<string[]>([])
 const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({})
 const [columnTypes, setColumnTypes] = useState<{[key: string]: ColumnType}>({})

 const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
   const file = event.target.files?.[0]
   if (file) {
     Papa.parse(file, {
       complete: (result) => {
         if (Array.isArray(result.data) && result.data.length > 0) {
           const parsedHeaders = result.data[0] as string[]
           const newHeaders = [...parsedHeaders, 'LLM_Eval', 'Human_Eval']
           setHeaders(newHeaders)
           
           const parsedData = result.data.slice(1).map((row: string[]) => {
             const rowData = {
               LLM_Eval: '',
               Human_Eval: '',
             } as RowData
             
             parsedHeaders.forEach((header, index) => {
               rowData[header] = row[index] || ''
             })
             return rowData
           })
           
           setData(parsedData)
           
           // 열 너비 설정
           setColumnWidths(Object.fromEntries(newHeaders.map(header => [header, 200])))
           
           // 열 타입 설정
           const defaultColumnTypes = Object.fromEntries(newHeaders.map(header => [
             header, 
             header === 'LLM_Eval' || header === 'Human_Eval' 
               ? { type: 'dropdown' as const, scoreRange: 7 }
               : { type: 'text' as const }
           ]))
           setColumnTypes(defaultColumnTypes)
         } else {
           console.error('Invalid CSV format')
           setHeaders([])
           setData([])
         }
       },
       error: (error) => {
         console.error('Error parsing CSV:', error)
         setHeaders([])
         setData([])
       },
     })
   }
 }, [])

 const handleCellEdit = useCallback((rowIndex: number, header: string, value: string) => {
   setData(prevData => {
     const newData = [...prevData]
     newData[rowIndex] = { 
       ...newData[rowIndex], 
       [header]: value 
     }
     return newData
   })
 }, [])

 const handleDownload = useCallback(() => {
   const csv = Papa.unparse({
     fields: headers,
     data: data.map(row => headers.map(header => row[header] || ''))
   })
   const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
   const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' })
   const url = URL.createObjectURL(blob)
   const link = document.createElement('a')
   link.href = url
   link.setAttribute('download', 'data.csv')
   document.body.appendChild(link)
   link.click()
   document.body.removeChild(link)
   URL.revokeObjectURL(url)
 }, [headers, data])

 return {
   data,
   setData,
   headers,
   setHeaders,
   columnWidths,
   setColumnWidths,
   columnTypes,
   setColumnTypes,
   handleFileUpload,
   handleCellEdit,
   handleDownload
 }
}