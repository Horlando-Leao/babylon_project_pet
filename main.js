var createScene = function () {


    var scene = new BABYLON.Scene(engine);

    // camera
    var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(0, 125, 120));
    camera.attachControl(canvas, true);

    // iluminação
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 0.5, 0), scene);

    /*-----------------------Corpo do carro------------------------------------------*/
    function create_car(scene) {
        // Material do corpo do carro
        var bodyMaterial = new BABYLON.StandardMaterial("body_mat", scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(Math.random(1), Math.random(1), Math.random(1));
        bodyMaterial.backFaceCulling = false;

        //Vetor tridimensional de pontos do trapézio dos lados do carro.
        var side = [new BABYLON.Vector3(-4, 2, -2),
        new BABYLON.Vector3(4, 2, -2),
        new BABYLON.Vector3(5, -2, -2),
        new BABYLON.Vector3(-7, -2, -2)
        ];

        side.push(side[0]);	//fechar trapézio

        //Vetor de pontos para moldar o caminho
        var extrudePath = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 4)];

        //Criar o corpo e aplicar material.
        var carBody = BABYLON.MeshBuilder.ExtrudeShape("body", { shape: side, path: extrudePath, cap: BABYLON.Mesh.CAP_ALL }, scene);
        carBody.material = bodyMaterial;
        /*-----------------------Fim da criação do corpo do carro------------------------------------------*/

        /*-----------------------Pneus------------------------------------------*/

        //Material das rodas
        var wheelMaterial = new BABYLON.StandardMaterial("wheel_mat", scene);
        var wheelTexture = new BABYLON.Texture("http://i.imgur.com/ZUWbT6L.png", scene);
        wheelMaterial.diffuseTexture = wheelTexture;

        //Definir a cor circundante das rodas para preto
        var faceColors = [];
        faceColors[1] = new BABYLON.Color3(0, 0, 0);

        //Definir textura da face do pneu
        var faceUV = [];
        faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
        faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1);

        //Criar interior frontal da roda e aplicar material
        var wheelFI = BABYLON.MeshBuilder.CreateCylinder("wheelFI", { diameter: 3, height: 1, tessellation: 24, faceColors: faceColors, faceUV: faceUV }, scene);
        wheelFI.material = wheelMaterial;

        //Rotacionar roda no plano XZ  
        wheelFI.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
        wheelFI.parent = carBody;


        /*-----------------------Fim da Roda------------------------------------------*/

        /*------------Criação de outras rodas e posição----------*/
        var wheelFO = wheelFI.createInstance("FO");
        wheelFO.parent = carBody;
        wheelFO.position = new BABYLON.Vector3(-4.5, -2, 2.8);

        var wheelRI = wheelFI.createInstance("RI");
        wheelRI.parent = carBody;
        wheelRI.position = new BABYLON.Vector3(2.5, -2, -2.8);

        var wheelRO = wheelFI.createInstance("RO");
        wheelRO.parent = carBody;
        wheelRO.position = new BABYLON.Vector3(2.5, -2, 2.8);

        wheelFI.position = new BABYLON.Vector3(-4.5, -2, -2.8);

        /*------------Fim da criação de outras rodas e posição----------*/

        /*-----------------------Caminho------------------------------------------*/

        // Criar vetor de pontos para descrever a curva
        var points = [];
        var n = 450; // número de pontos
        var r = 50; //raio
        for (var i = 0; i < n + 1; i++) {
            points.push(new BABYLON.Vector3((r + (r / 5) * Math.sin(8 * i * Math.PI / n)) * Math.sin(2 * i * Math.PI / n), 0, (r + (r / 10) * Math.sin(6 * i * Math.PI / n)) * Math.cos(2 * i * Math.PI / n)));
        }

        //Desenhar a curva
        var track = BABYLON.MeshBuilder.CreateLines('track', { points: points }, scene);
        track.color = new BABYLON.Color3(0, 0, 0);
        /*-----------------------Fim do caminho------------------------------------------*/

        /*-----------------------Solo------------------------------------------*/
        var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 3 * r, height: 3 * r }, scene);
        /*-----------------------Fim do solo------------------------------------------*/

        /*----------------Posicionar e girar o carro para o começo---------------------------*/
        carBody.position.y = 4;
        carBody.position.z = r;

        var path3d = new BABYLON.Path3D(points);
        var normals = path3d.getNormals();
        var theta = Math.acos(BABYLON.Vector3.Dot(BABYLON.Axis.Z, normals[0]));
        carBody.rotate(BABYLON.Axis.Y, theta, BABYLON.Space.WORLD);
        var startRotation = carBody.rotationQuaternion;
        /*----------------Fim de posicionar e girar o carro para o começo---------------------*/

        /*----------------Ciclo de animação---------------------------*/
        var i = 0;
        scene.registerAfterRender(function () {
            carBody.position.x = points[i].x;
            carBody.position.z = points[i].z;
            wheelFI.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);
            wheelFO.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);
            wheelRI.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);
            wheelRO.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);

            theta = Math.acos(BABYLON.Vector3.Dot(normals[i], normals[i + 1]));
            var dir = BABYLON.Vector3.Cross(normals[i], normals[i + 1]).y;
            var dir = dir / Math.abs(dir);
            carBody.rotate(BABYLON.Axis.Y, dir * theta, BABYLON.Space.WORLD);

            i = (i + 1) % (n - 1);	//laço contínuo 

            if (i == 0) {
                carBody.rotationQuaternion = startRotation;
            }
        });
    }
    /*----------------Fim do ciclo de animação---------------------------*/
    // Criação de 5 objetos do tipo carro
    var x = 0;

    var intervalID = setInterval(function () {
        create_car(scene)
        if (++x === 5) {
            window.clearInterval(intervalID);
        }
    }, 2000);

    return scene;
}
