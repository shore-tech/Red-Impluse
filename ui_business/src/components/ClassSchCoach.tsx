// react component for member page
import { useContext, useEffect, useState } from "react";

// third party imports
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Avatar, Box, Button, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import AddIcon from '@mui/icons-material/Add';


// local imports
import { LoadingBox, MessageBox, styleMainColBox } from "./CommonComponents";
import { db } from "../utils/firebaseConfig";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import { CoachObj } from "../utils/dataInterface";
import CoachAddEdit from "./ClassSchCoachAddEdit";



export default function ClassSchCoach() {
    const coachDocRef = doc(db, `/class_list/coach`)

    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [clsTypeList, setClsTypeList] = useState<string[]>([])
    const [coachesData, setCoachesData] = useState<{ [coachName: string]: CoachObj }>({})

    const [showAddClsType, setShowAddClsType] = useState<boolean>(false)
    const [showDelClsType, setShowDelClsType] = useState<boolean>(false)

    const [newClsType, setNewClsType] = useState<string>('')
    const [delTarget, setDeltarget] = useState<string>(clsTypeList[0])

    const [targetCoach, setTargetCoach] = useState<string>('')
    const [openEditCoach, setOpenEditCoach] = useState<boolean>(false)

    const [tableRows, setTableRows] = useState<(string | boolean)[]>([])
    const tableCol: GridColDef[] = [
        { field: 'coachName', headerName: '教練名稱', type: 'string', minWidth: 120, editable: true },
        ...clsTypeList.map(item => ({ field: item, headerName: item, type: 'boolean', minWidth: 100, editable: true, headerAlign: 'center', align: 'center' } as GridColDef)),
    ]
    // custom toolbar to add new coach
    const CustomToolbar = () => {
        function addNewRow() { }
        return (
            <GridToolbarContainer>
                <Button color="primary" startIcon={<AddIcon />} onClick={() => handleEditCoach('new')}>
                    新增教練
                </Button>
            </GridToolbarContainer>
        );
    }
    // functions for class type
    const handleAddClsType = () => {
        setIsLoading(true)
        let updatedCoachData = { ...coachesData }
        for (const coachName of Object.keys(updatedCoachData)) {
            updatedCoachData[coachName][newClsType] = false
        }
        let updatedCoachCls = {
            classType: [...clsTypeList, newClsType],
            ...updatedCoachData
        }
        setDoc(coachDocRef, updatedCoachCls).then(() => {
            setShowAddClsType(false)
            setNewClsType('')
            setSuccessMessage(`新增類型 ${newClsType} 成功`)
        }).catch((error) => {
            setErrorMessage(`新增類型 ${newClsType} 失敗: ${error}`)
        })
    }
    const handleDelClsType = () => {
        setIsLoading(true)
        let updatedCoachData = { ...coachesData }
        for (const coachName of Object.keys(updatedCoachData)) {
            delete updatedCoachData[coachName][delTarget]
        }
        let updatedCoachCls = {
            classType: clsTypeList.filter((item) => item !== delTarget),
            ...updatedCoachData
        }
        setDoc(coachDocRef, updatedCoachCls).then(() => {
            setShowDelClsType(false)
            setDeltarget(clsTypeList[0])
            setSuccessMessage(`刪除類型 ${delTarget} 成功`)
        }).catch((error) => {
            setErrorMessage(`刪除類型 ${delTarget} 失敗: ${error}`)
        })
    }

    // functions for coach table
    const handleEditCoach = (id: string) => {
        setTargetCoach(id)
        setOpenEditCoach(true)
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, '/class_list/coach'), (coaches) => {
            if (coaches.data()) {
                let coachesData = coaches.data()!;
                setClsTypeList(coachesData['classType'] as string[])
                delete coachesData['classType']
                const coachNameListDb = Object.keys(coachesData)

                let updateTableRows: (string | boolean)[] = []
                for (const coachName of coachNameListDb) {
                    updateTableRows.push({
                        id: coachName,
                        coachName: coachName,
                        ...coachesData[coachName]
                    })
                }
                setTableRows(updateTableRows)
                setCoachesData(coachesData)
            }
        })
        return unsubscribe
    }, [])

    return (
        <Container component="main" sx={styleMainColBox}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <SportsGymnasticsIcon />
                </Avatar>
                <Typography variant="body1">
                    教練列表
                </Typography>
            </Box>
            <Container sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2, marginBottom: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, mb: 1 }}>
                    <Typography variant="body1">
                        課堂類型
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" color="primary" onClick={() => { setShowAddClsType(!showAddClsType); setShowDelClsType(false) }} >
                            {showAddClsType ? '取消新增' : '新增類型'}
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => { setShowDelClsType(!showDelClsType); setShowAddClsType(false) }} disabled={clsTypeList.length === 0} >
                            {showDelClsType ? '取消刪除' : '刪除類型'}
                        </Button>

                    </Box>
                </Box>
                {showAddClsType && <>
                    <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
                    <Box sx={{ paddingX: 2, display: 'flex', alignItems: 'center', justifyContent: `space-around`, mb: 1 }}>
                        <TextField
                            label="新類型"
                            variant="outlined"
                            value={newClsType}
                            onChange={(e) => setNewClsType(e.target.value)}
                        />
                        <Button variant="contained" color="primary" onClick={() => { handleAddClsType() }} >
                            新增
                        </Button>

                    </Box>

                </>}

                {showDelClsType && <>
                    <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
                    <Box sx={{ paddingX: 2, display: 'flex', alignItems: 'center', justifyContent: `space-around`, mb: 1 }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>課堂類別列表</InputLabel>
                            <Select
                                label="課堂類別列表"
                                value={delTarget}
                                onChange={(e) => setDeltarget(e.target.value)}
                            >
                                {clsTypeList.map((item, index) => (
                                    <MenuItem key={index} value={item}>{item}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" onClick={() => { handleDelClsType() }} >
                            刪除
                        </Button>
                    </Box>
                </>}

                <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
                {clsTypeList.length > 0
                    ? <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {clsTypeList.join(' --- ')}</Box>
                    : <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> *** 未有課堂類型 *** </Box>
                }

                <Box sx={{ width: '100%', overflow: 'auto', mt: 2 }}>
                    <DataGrid
                        disableColumnMenu
                        slots={{ toolbar: CustomToolbar }}
                        rows={tableRows}
                        columns={tableCol}
                        onRowDoubleClick={(row) => { handleEditCoach(row.row.id) }}
                    />
                </Box>


            </Container>
            {openEditCoach && <CoachAddEdit open={openEditCoach} onClose={() => setOpenEditCoach(false)} clsTypeList={clsTypeList} coachesData={coachesData} targetCoach={targetCoach} />}

            {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
            {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => { setIsLoading(false); setInfoMessage(undefined) }} type='info' message={infoMessage} />}
            {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => { setIsLoading(false); setErrorMessage(undefined) }} type='error' message={errorMessage} />}
            {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => { setIsLoading(false); setSuccessMessage(undefined) }} type='success' message={successMessage} />}

        </Container>
    );
}
