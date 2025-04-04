// react component for member page
import { useEffect, useState } from "react";

// third party imports
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridEventListener, GridRowEditStopReasons, GridRowId, GridRowModel, GridRowModes, GridRowModesModel, GridSlots, GridToolbarContainer } from "@mui/x-data-grid";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import dayjs from "dayjs";

// local imports
import { btnBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { MemberObj, BjjLevelRecord, BjjLevelRecordEntry } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";

export default function MemberEditBjj(props: { open: boolean, onClose: () => void, selectedRow: MemberObj }) {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)

    const summaryRocRef = doc(db, '/member_list/summary')
    const memberDocRef = doc(db, `/member_list/${props.selectedRow.id}`)
    const [memberInfo, setMemberInfo] = useState<MemberObj>(props.selectedRow)
    const [bjjRecord, setBjjRecord] = useState<BjjLevelRecord | undefined>(props.selectedRow.bjjRecord)

    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({}); // [edit|view] mode for all the rows
    const [tableRows, setTableRows] = useState<BjjLevelRecordEntry[]>([])
    const tableCols: GridColDef[] = [
        { field: 'promotionDate', headerName: '晉升日期', type: 'string', minWidth: 120, editable: true },
        { field: 'beltColor', headerName: 'BJJ顏色', type: 'string', minWidth: 120, editable: true },
        { field: 'stripe', headerName: '段數', type: 'number', minWidth: 120, editable: true, headerAlign: 'center', align: 'center' },
        { field: 'promotionBy', headerName: '教練', type: 'string', minWidth: 120, editable: true },
        { field: 'actions', type: 'actions', headerName: 'Actions', width: 100, cellClassName: 'actions', getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{ color: 'primary.main' }}
                            onClick={() => handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={() => handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                } else {
                    return [
                        <GridActionsCellItem
                            icon={<DeleteIcon />}
                            label="Delete"
                            onClick={() => handleDeleteClick(id)}
                            color="inherit"
                        />,
                    ];
                }
            },
        }
    ]
    // CRUD functions
    const handleSaveClick = (id: GridRowId) => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        });
    }
    const handleCancelClick = (id: GridRowId) => {
        // delete the row from the table
        const updatedRows = tableRows.filter((row) => row.id !== id);
        setTableRows(updatedRows);
    }

    const handleDeleteClick = (id: GridRowId) => {
        console.log('deletinf row from db');
        const updatedBjjRecord: BjjLevelRecord = {...bjjRecord}
        delete updatedBjjRecord[id as string]
        updateMemberInfo(updatedBjjRecord)
    }

    // custom toolbar
    const CustomToolbar = () => {
        function addNewRow() {
            const id = dayjs().format('YYYY-MM-DD');
            setTableRows([
                { id: id, promotionDate: id, beltColor: '', stripe: 0, promotionBy: '' },
                ...tableRows,
            ])
            setRowModesModel({
                ...rowModesModel,
                [id]: { mode: GridRowModes.Edit, fieldToFocus: 'promotionDate' }
            });

        }
        return (
            <GridToolbarContainer>
                <Button color="primary" startIcon={<AddIcon />} onClick={addNewRow}>
                    Add record
                </Button>
            </GridToolbarContainer>
        );
    }

    // event listeners
    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        console.log('row mode change', newRowModesModel);
        setRowModesModel(newRowModesModel);
    };

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        // prenvent exiting edit mode when clicking out of the row
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
        console.log('row edit stop', params, event);
        console.log(params);
        console.log(event);
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        // update the newRow arg into the database and return the updated row to the data grid
        delete newRow['id']
        const updatedBjjRecord: BjjLevelRecord = {
            ...bjjRecord,
            [newRow.promotionDate]: newRow
        }
        updateMemberInfo(updatedBjjRecord)
        newRow['id'] = newRow.promotionDate
        return newRow;
    };

    const updateMemberInfo = (updatedBjjRecord: BjjLevelRecord) => {
        // get the latest bjj record based on the key
        const maxKey:string = Object.keys(updatedBjjRecord).reduce((max, key) => (key > max ? key : max), "");

        const updatedMemebrInfo: MemberObj = {
            ...memberInfo,
            beltColor: updatedBjjRecord[maxKey].beltColor,
            stripe: updatedBjjRecord[maxKey].stripe,
            bjjRecord: updatedBjjRecord
        }
        updateDoc(summaryRocRef, { [props.selectedRow.id!]: updatedMemebrInfo }).then(() => {
            console.log('updated summary record');
            updateDoc(memberDocRef, {...updatedMemebrInfo}).then(() => {
                console.log('updated member record');
                setSuccessMessage(`BJJ Record updated successfully.`)
            })
        }).catch(err => {
            console.log('error updating member record', err);
            setErrorMessage(err.message)
        })
    }


    useEffect(() => {
        if (bjjRecord) {
            const rows: BjjLevelRecordEntry[] = []
            for (const [promotionDate, record] of Object.entries(bjjRecord)) {
                rows.push({
                    id: promotionDate,
                    ...record
                })
            }
            // sort rows by promotionDate
            rows.sort((a, b) => {
                if (a.promotionDate < b.promotionDate) return 1
                if (a.promotionDate > b.promotionDate) return -1
                return 0
            })
            setTableRows(rows)
        } else {
            setTableRows([])
        }
    }, [bjjRecord])


    useEffect(() => {
        const unsubscribe = onSnapshot(memberDocRef, (memberDoc) => {
            if (memberDoc.exists()) {
                setMemberInfo(memberDoc.data() as MemberObj)
                setBjjRecord(memberDoc.data().bjjRecord)
            }
        }, (error) => { setErrorMessage(error.message) })
        return unsubscribe
    }, [])

    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Box sx={styleModalBox}>
                <Box sx={styleFormHeadBox}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <PersonAddIcon /> </Avatar>
                    <Typography component="h1" variant="h5">
                        BJJ Level Record
                    </Typography>
                    <Typography component="h2" variant="h5">  {props.selectedRow.id} - {props.selectedRow.fullName}</Typography>
                </Box>

                <Box width={'100%'}>
                    <DataGrid
                        disableColumnMenu
                        slots={{ toolbar: CustomToolbar }}
                        columns={tableCols}
                        rows={tableRows}
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={handleRowModesModelChange}
                        processRowUpdate={processRowUpdate}
                        onRowEditStop={handleRowEditStop}
                    />
                </Box>
                <Box sx={btnBox}><Button variant="contained" onClick={props.onClose}>Close</Button></Box>

                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => setErrorMessage(undefined)} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={()=>setSuccessMessage(undefined)} type='success' message={successMessage} />}
            </Box>
        </Modal>
    );
}
