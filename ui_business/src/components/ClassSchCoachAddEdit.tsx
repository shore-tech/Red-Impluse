// react component for member page
import { useEffect, useState } from "react";

// third party imports
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, FormGroup, FormControlLabel, Grid, Modal, TextField, Typography, Checkbox } from "@mui/material";
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';

// local imports
import { btnBox, LoadingBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { MemberObj, BjjLevelRecord, BjjLevelRecordEntry, CoachObj } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";

export default function CoachAddEdit(props: { open: boolean, onClose: () => void, clsTypeList: string[], coachesData: { [coachName: string]: CoachObj }, targetCoach: string }) {
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [coachName, setCoachName] = useState<string>(props.targetCoach)
    const [coachClass, setCoachClass] = useState<CoachObj>({})
    const [showCfmDel, setShowCfmDel] = useState<boolean>(false)

    const handleSaveChange = () => {
        if (props.targetCoach === 'new' && coachName in props.coachesData) {
            setErrorMessage(`教練 ${coachName} 已存在!`)
            return
        }
        setIsLoading(true)
        updateDoc(doc(db, `/class_list/coach`), { [coachName]: coachClass }).then(() => {
            if (props.targetCoach === 'new') {
                setSuccessMessage(`已新增教練 ${coachName} !`)
            } else {
                setSuccessMessage(`教練 ${coachName} 已更新!`)
            }
        }).catch((err) => {
            setErrorMessage(`Error: ${err.message}`)
        })
    }
    const handleDelCoach = () => {
        setIsLoading(true)
        updateDoc(doc(db, `/class_list/coach`), { [props.targetCoach]: null }).then(() => {
            setSuccessMessage(`教練 ${props.targetCoach} 已刪除!`)
        }).catch((err) => {
            setErrorMessage(`Error: ${err.message}`)
        })
    }



    useEffect(() => {
        if (props.targetCoach !== 'new') {
            setCoachName(props.targetCoach)
            setCoachClass(props.coachesData[props.targetCoach])
        } else {
            let newCoachObj: CoachObj = {}
            for (const clsType of props.clsTypeList) {
                newCoachObj[clsType] = false
            }
            setCoachName('')
            setCoachClass(newCoachObj)
        }
    }, [props.targetCoach, props.coachesData])

    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Box sx={styleModalBox}>
                <Box sx={styleFormHeadBox}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <SportsGymnasticsIcon /> </Avatar>
                    <Typography component="h1" variant="h5">
                        {props.targetCoach === 'new' ? '新增教練' : '編輯教練資料'}
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='教練名稱'
                            value={coachName}
                            onChange={(e) => setCoachName(e.target.value)}
                            disabled={props.targetCoach !== 'new'}
                        />
                        <Typography variant="caption" color="text.secondary">
                            課堂類別
                        </Typography>

                        {coachClass && (
                            <FormGroup>
                                {Object.entries(coachClass).map(([clsName, value]) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                key={clsName}
                                                checked={value}
                                                onChange={(e) => setCoachClass({ ...coachClass, [clsName]: e.target.checked })}
                                            />
                                        }
                                        label={clsName}
                                        key={clsName}
                                    />
                                ))}
                            </FormGroup>
                        )}
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                        <Button variant="contained" color="primary" onClick={handleSaveChange} sx={{ width: '50%', my: 1 }}>
                            儲存
                        </Button>
                        <Button variant="contained" color="primary" onClick={props.onClose} sx={{ width: '50%', my: 1 }}>
                            取消
                        </Button>
                        {props.targetCoach !== 'new' && <Button variant="contained" color="primary" onClick={() => setShowCfmDel(!showCfmDel)} sx={{ width: '50%', my: 1 }}>
                            {showCfmDel ? '取消刪除' : '刪除教練'}
                        </Button>}
                        {showCfmDel && <Button variant="contained" color="primary" onClick={handleDelCoach} sx={{ width: '50%', my: 1 }}>
                            確定删除!
                        </Button>}
                    </Grid>
                </Grid>
                {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
                {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => { setIsLoading(false); setInfoMessage(undefined) }} type='info' message={infoMessage} />}
                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => { setIsLoading(false); setErrorMessage(undefined) }} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={props.onClose} type='success' message={successMessage} />}

            </Box>
        </Modal>
    );
}
