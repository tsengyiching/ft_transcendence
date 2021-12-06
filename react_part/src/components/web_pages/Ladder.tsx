import {Image, Row, Col} from 'react-bootstrap'

export default function Ladder() {
    return (
        <div>
            Ladder :
            <div className="row">
                <div className="col">
                    <div className="row">
                        Nom
                    </div>
                </div>
                <div className="col">
                    <div className="row">
                        Win Matches
                    </div>
                </div>
                <div className="col">
                    <div className="row">
                        Lost Matches
                    </div>
                </div>
            </div>
        </div>
    )
}