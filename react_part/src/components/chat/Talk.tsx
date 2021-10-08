import 'bootstrap/dist/css/bootstrap.min.css'

function Talk() {
    return (
        <div className="overflow-auto" style={{height: '675px', border:'1px solid black'}}>
           <div className="main">
                <div className="px-2 scroll">
                    <div className="d-flex align-items-center">
                        <div className="text-left pr-1"><img src="https://img.icons8.com/color/40/000000/guest-female.png" width="30" className="img1" alt="imagefirst"/></div>
                        <div className="pr-2 pl-1"> <span className="name">Le swag</span>
                            <p className="msg">Salut salut comment tu va ?</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center text-right justify-content-end ">
                        <div className="pr-2"> <span className="name">Moi</span>
                            <p className="msg">Pas le temps de discuter on doit travailler !</p>
                        </div>
                        <div><img src="https://i.imgur.com/HpF4BFG.jpg" width="30" className="img1" alt="image1"/></div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="text-left pr-1"><img src="https://img.icons8.com/color/40/000000/guest-female.png" width="30" className="img1" alt="image2"/></div>
                        <div className="pr-2 pl-1"> <span className="name">Le swag</span>
                            <p className="msg">Oh ok ça roule je me mets au travail</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="text-left pr-1"><img src="https://img.icons8.com/color/40/000000/guest-female.png" width="30" className="img1" alt="image2"/></div>
                        <div className="pr-2 pl-1"> <span className="name">Le swag</span>
                            <p className="msg">On s'appelle tout à l'heure ?</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center text-right justify-content-end ">
                        <div className="pr-2"> <span className="name">Moi</span>
                            <p className="msg">Oui pas de problème mais avant ça il faut travailler sinon Arthur, Yiching et Lou vous pas être content</p>
                        </div>
                        <div><img src="https://i.imgur.com/HpF4BFG.jpg" width="30" className="img1" alt="image1"/></div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="text-left pr-1"><img src="https://img.icons8.com/color/40/000000/guest-female.png" width="30" className="img1" alt="image2"/></div>
                        <div className="pr-2 pl-1"> <span className="name">Babe</span>
                            <p className="msg">D'accord !! !</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Talk;