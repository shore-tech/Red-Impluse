// react component for member page
import { useContext, useEffect, useState } from "react";

// third party imports
import { Avatar, Box, Button, Container, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import ContactsIcon from '@mui/icons-material/Contacts';
import AddIcon from '@mui/icons-material/Add';

// local imports
import { auth, db } from "../utils/firebaseConfig";
import { styleMainColBox, btnBox } from "./CommonComponents";
import { MemberObj } from "../utils/dataInterface";
import { collection, doc, onSnapshot, sum } from "firebase/firestore";
import { CustomClaimsCtx } from "../utils/contexts";
import MemberAdd from "./MemberAdd";
import MemberEditBasic from "./MemberEditBasic";
import MemberEditBjj from "./MemberEditBjj";


export default function Member() {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [openAddMember, setOpenAddMember] = useState<boolean>(false)
    const [selectedRow, setSelectedRow] = useState<MemberObj | undefined>(undefined)
    const [openMemberEditBasic, setOpenMemberEditBasic] = useState<boolean>(false)
    const [openMemberEditBjj , setOpenMemberEditBjj] = useState<boolean>(false)


    const [tableRows, setTableRows] = useState<MemberObj[]>([])
    const tableCol: GridColDef[] = [
        { field: 'id', headerName: 'ID', type: 'string', minWidth: 60 },
        { field: 'fullName', headerName: '姓名', type: 'string', minWidth: 120 },
        { field: 'mbsExpDate', headerName: '會藉到期日', type: 'string', minWidth: 120 },
        { field: 'beltColor', headerName: 'BJJ顏色', type: 'string', minWidth: 120 },
        { field: 'stripe', headerName: '段數', type: 'number', minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'promotionDate', headerName: '晉升日期', type: 'string', minWidth: 120 },
        { field: 'gender', headerName: '性別', type: 'string', minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'dateOfBirth', headerName: '生日', type: 'string', minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'mobile', headerName: '電話', type: 'string', minWidth: 120 },
    ]

    const userClaimCtx = useContext(CustomClaimsCtx);

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
                const rowEntries: MemberObj[] = []
                for (const [mbs_id, mbs_data] of Object.entries(snapshot.data())) {
                    rowEntries.push({
                        ...mbs_data,
                        id: mbs_id,
                    })
                }
                // sort rows by id
                rowEntries.sort((a, b) => {
                    if (a.id! < b.id!) return -1
                    if (a.id! > b.id!) return 1
                    return 0
                })
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
            <Box sx={{ width: '100%', height: 400, overflow: 'auto' }}>
                <DataGrid
                    slots={{ toolbar: CustomToolbar }}
                    loading={isLoading}
                    rows={tableRows}
                    columns={tableCol}
                    onCellDoubleClick={(cell) => {
                        console.log(`double clicked on ${cell.field}`);
                        console.log(`double clicked on ${cell.row.id}`);
                        setSelectedRow(cell.row)
                        if (cell.field === 'beltColor' || cell.field === 'stripe' || cell.field === 'promotionDate') {
                            console.log(`double clicked on ${cell.field} ${cell.value}`);
                            setOpenMemberEditBjj(true)
                        } else {
                            setOpenMemberEditBasic(true)
                        }
                    }}
                />
            </Box>

            {userClaimCtx && userClaimCtx.roleLevel >= 3 && <MemberAdd open={openAddMember} onClose={() => setOpenAddMember(false)} />}
            {userClaimCtx && userClaimCtx.roleLevel >= 3 && selectedRow && <MemberEditBasic open={openMemberEditBasic} onClose={() => { setOpenMemberEditBasic(false); setSelectedRow(undefined) }} selectedRow={selectedRow} />}
            {userClaimCtx && userClaimCtx.roleLevel >= 3 && selectedRow && <MemberEditBjj open={openMemberEditBjj} onClose={() => { setOpenMemberEditBjj(false); setSelectedRow(undefined) }} selectedRow={selectedRow} />}
        </Container>
    );
}
