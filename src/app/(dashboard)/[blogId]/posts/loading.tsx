import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-[150px]" />
                <Skeleton className="h-9 w-[100px]" />
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]"><Skeleton className="h-4 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-4 w-full" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
