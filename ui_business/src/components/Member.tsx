// react component for member page
import { useEffect, useState } from "react";

// third party imports
import { Avatar, Box, Button, Container, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import ContactsIcon from '@mui/icons-material/Contacts';
import AddIcon from '@mui/icons-material/Add';

// local imports
import { auth, db } from "../utils/firebaseConfig";
import { styleMainColBox, btnBox } from "./CommonComponents";
import { GridMemberRowEntry } from "../utils/dataInterface";
import { collection, doc, onSnapshot, sum } from "firebase/firestore";
import { CustomClaimsCtx } from "../utils/contexts";


export default function Member() {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [openAddMember, setOpenAddMember] = useState<boolean>(false)
    const [selectedRow, setSelectedRow] = useState<GridMemberRowEntry | undefined>(undefined)


    const [tableRows, setTableRows] = useState<GridMemberRowEntry[]>([])
    const tableCol: GridColDef[] = [
        { field: 'id', headerName: 'ID', type: 'string', minWidth: 60 },
        { field: 'name', headerName: '姓名', type: 'string', minWidth: 100 },
        { field: 'gender', headerName: '性別', type: 'string', minWidth: 60, headerAlign: 'center', align: 'center' },
        { field: 'dateOfBirth', headerName: '生日', type: 'string', minWidth: 100, headerAlign: 'center', align: 'center' },
        { field: 'mobile', headerName: '電話', type: 'string', minWidth: 100 },
        { field: 'beltColor', headerName: 'BJJ顏色', type: 'string', minWidth: 80 },
        { field: 'stripe', headerName: '段數', type: 'number', minWidth: 80, headerAlign: 'center', align: 'center' },
        { field: 'promotionDate', headerName: '晉升日期', type: 'string', minWidth: 100 },
        { field: 'mbsExpDate', headerName: '會藉到期日', type: 'string', minWidth: 100 },
    ]

    const userClaimCtx = useState(CustomClaimsCtx);

        // custom toolbar to add new member
        const CustomToolbar = () => {
            return (
                <GridToolbarContainer>
                    <Button color="primary" startIcon={<AddIcon />} onClick={() => setOpenAddMember(true)}>
                        新增會員
                    </Button>
                </GridToolbarContainer>
            );
        }

    useEffect(() => {
        setIsLoading(true)
        const customerSumRef = doc(db, '/member_list/summary')
        const unsubscribe = onSnapshot(customerSumRef, (snapshot) => {
            // const data_sum = snapshot.data()
            console.log(snapshot.data());
            if (snapshot.exists()) {
                const rowEntries: GridMemberRowEntry[] = []
                for (const [mbs_id, mbs_data] of Object.entries(snapshot.data())) {
                    rowEntries.push({
                        id: mbs_id,
                        name: mbs_data.name ?? '',
                        gender: mbs_data.gender ?? '',
                        dateOfBirth: mbs_data.dateOfBirth ?? '',
                        mobile: mbs_data.mobile ?? '',
                        beltColor: mbs_data.beltColor ?? '',
                        stripe: mbs_data.stripe ?? 0,
                        promotionDate: mbs_data.promotionDate ?? '',
                        mbsExpDate: mbs_data.mbsExpDate,
                    })
                }
                setTableRows(rowEntries)
            }
            setIsLoading(false)
        }, (error) => {
            console.log(error);
            setErrorMessage(error.message)
        })

        return unsubscribe
    }, [])


    return (
        <Container component="main" sx={styleMainColBox}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <ContactsIcon />
                </Avatar>
                <Typography variant="body1">
                    會員資料
                </Typography>
            </Box>
            <DataGrid
                slots={{ toolbar: CustomToolbar }}
                loading={isLoading}
                rows={tableRows}
                columns={tableCol}
                onRowDoubleClick={(row) => {
                    console.log(`double clicked on ${row.row.id}`);
                }}
            />



        </Container>
    );
}
