// react component for member page
import { useContext, useEffect, useState } from "react";

// third party imports
import { Avatar, Box, Button, Container, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import ContactsIcon from '@mui/icons-material/Contacts';
import AddIcon from '@mui/icons-material/Add';

// local imports
import { db } from "../utils/firebaseConfig";
import { styleMainColBox, btnBox, LoadingBox, MessageBox } from "./CommonComponents";
import { SystemUserObj } from "../utils/dataInterface";
import { doc, onSnapshot } from "firebase/firestore";
import { CustomClaimsCtx } from "../utils/contexts";
import SystemUserAdd from "./SystemUserAdd";
import SystemUserEdit from "./SystemUserEdit";


export default function SystemUser() {
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // const [memberEmailList, setMemberEmailList] = useState<string[]>([])
    const [sysUsrEmailList, setSysUsrEmailList] = useState<string[]>([])

    // const [openAddMember, setOpenAddMember] = useState<boolean>(false)
    const [openAddSysUsr, setOpenAddSysUsr] = useState<boolean>(false)
    const [selectedRow, setSelectedRow] = useState<SystemUserObj | undefined>(undefined)
    const [openEditSysUsr, setOpenEditSysUsr] = useState<boolean>(false)


    const [tableRows, setTableRows] = useState<SystemUserObj[]>([])
    const tableCol: GridColDef[] = [
        { field: 'id', headerName: 'ID', type: 'string', minWidth: 60 },
        { field: 'roleLevel', headerName: '權限', type: 'string', minWidth: 60 },
        { field: 'role', headerName: 'Role', type: 'string', minWidth: 120 },
        { field: 'displayName', headerName: 'Name', type: 'string', minWidth: 120 },
        { field: 'email', headerName: 'e-mail', type: 'string', minWidth: 120 },
        { field: 'CreatedBy', headerName: 'CreatedBy', type: 'string', minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'CreatedAt', headerName: 'CreatedAt', type: 'string', minWidth: 120, headerAlign: 'center', align: 'center' },
    ]

    const userClaimCtx = useContext(CustomClaimsCtx);

    // custom toolbar to add new member
    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                {sysUsrEmailList &&
                    <Button color="primary" startIcon={<AddIcon />} onClick={() => setOpenAddSysUsr(true)}>
                        新增系統使用者
                    </Button>
                }
            </GridToolbarContainer>
        );
    }

    useEffect(() => {
        setIsLoading(true)
        const customerSumRef = doc(db, '/system_user/summary')
        let emailList: string[] = []
        const unsubscribe = onSnapshot(customerSumRef, (snapshot) => {
            const data_sum = snapshot.data()
            const rowEntries: SystemUserObj[] = []
            for (const [mbs_id, mbs_data] of Object.entries(data_sum!)) {
                rowEntries.push({
                    ...mbs_data,
                    id: mbs_id,
                })
                emailList.push(mbs_data.email)
            }
            // sort rows by id
            rowEntries.sort((a, b) => {
                if (a.id! < b.id!) return -1
                if (a.id! > b.id!) return 1
                return 0
            })
            setIsLoading(false)
            setTableRows(rowEntries)
            setSysUsrEmailList(emailList)
        }, (error) => {
            setIsLoading(false)
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
                    系統使用者資料
                </Typography>
            </Box>
            <Box sx={{ width: '100%', overflow: 'auto' }}>
                <DataGrid
                    disableColumnMenu
                    slots={{ toolbar: CustomToolbar }}
                    loading={isLoading}
                    rows={tableRows}
                    columns={tableCol}
                    onRowDoubleClick={(row) => {
                        console.log(`double clicked on ${row.row.id}`);
                        console.log(row.row);
                        setSelectedRow(row.row)
                        setOpenEditSysUsr(true)
                    }}
                />
            </Box>

            {openAddSysUsr && <SystemUserAdd open={openAddSysUsr} onClose={() => setOpenAddSysUsr(false)} sysUsrEmailList={sysUsrEmailList} />}
            {userClaimCtx && userClaimCtx.roleLevel >= 3 && selectedRow && <SystemUserEdit open={openEditSysUsr} onClose={() => { setOpenEditSysUsr(false); setSelectedRow(undefined) }} selectedRow={selectedRow} />}

        </Container>
    );
}
