import { useState } from 'react'
import { ChangeNickName } from './ChangeNickName';
import { ChangeTwoFA } from './ChangeTwoFA';
import { ChangeImage } from './ChangeImage';

function Parametre () {

    return (
        <div>
            <div className="row">
                <div className="col">
                    <div className="row">
                        <div className="row w-50 p-3">
                            <ChangeNickName/>
                        </div>
                        <div className="row w-50 p-3">
                            <ChangeImage/>
                        </div>
                        <div className="row w-50 p-3">
                            <ChangeTwoFA/>
                        </div>
                    </div>
                </div>
                <div className="col">
                </div>
            </div>
        </div>
    )
}

export default Parametre;