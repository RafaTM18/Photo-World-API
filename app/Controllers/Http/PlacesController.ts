import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import cloudinary from 'cloudinary';
import Env from '@ioc:Adonis/Core/Env';

import Place from 'App/Models/Place';

const messages = {
    'required': 'O campo {{ field }} é obrigatório',
    'alpha': 'O campo {{ field }} precisa conter somente letras',
    'minLength': 'O campo {{ field }} precisa ter no mínimo {{ options.minLength }} caracteres',
    'maxLength': 'O campo {{ field }} precisa ter no máximo {{ options.maxLength }} caracteres',
    'unique': 'O campo {{ field }} precisa ser único, esse {{ field }} já foi utilizado',
    'url': 'O campo {{ field }} precisar ser uma URL válida',
}

cloudinary.v2.config({
    cloud_name: Env.get('CLOUD_NAME'),
    api_key: Env.get('API_KEY'),
    api_secret: Env.get('API_SECRET'),
})

export default class PlacesController {
    private validationOpt = {
        types: ['image'],
        size: '2mb',
    }

    public async index() {
        let places = await Place.all()
        return places.length == 0 ? 'Não foi adicionado nenhum lugar' : places.map((place) => place.serialize());
    }

    public async show({ params, response} : HttpContextContract) {
        const id = params.id;

        let place = await Place.find(id);
        if (place) {
            response.status(200);
            return place.serialize();
        }

        response.status(404);
        return 'Lugar não encontrado';
    }

    public async store({ request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            nome: schema.string({trim: true}, [
                rules.required(),
                rules.alpha(),
                rules.unique({ table: 'places', column: 'nome'}),
                rules.minLength(3),
                rules.maxLength(50),
            ]),
            desc: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(250),
            ]),
            local: schema.string({trim: true}, [
                rules.required(),
                rules.url(),
            ]),
        });

        const img = request.file('img', this.validationOpt);
        let imgUrl;

        if (img) {
            const tempPath = img.tmpPath || "https://res.cloudinary.com/photo-world-api/image/upload/v1653678061/tempFile.jpg"
            try {
                const result = await cloudinary.v2.uploader.upload(tempPath);
                imgUrl = result?.url;
            } catch (error) {
                response.badRequest(error.messages)
            }
        }
        
        const body = await request.validate({schema: validationSchema, messages}); 
        const place = await Place.create(body);

        if (place) {
            place.img = imgUrl;
            await place.save();

            response.status(201);
            return {
                message: 'Lugar cadastrado com sucesso!',
                data: place,
            }
        }
        
        response.status(500);
        return 'Houve um erro ao realizar o cadastro do lugar';
    }

    public async update({ params, request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            nome: schema.string({trim: true}, [
                rules.required(),
                rules.alpha(),
                rules.unique({ table: 'places', column: 'nome'}),
                rules.minLength(3),
                rules.maxLength(50),
            ]),
            desc: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(250),
            ]),
            local: schema.string({trim: true}, [
                rules.required(),
                rules.url(),
            ]),
        });
        const id = params.id;
        const body = await request.validate({schema: validationSchema, messages});
        const place = await Place.find(id);

        if (place) {
            const img = request.file('img', this.validationOpt);
            let imgUrl;
            if (img) {
                const tempPath = img.tmpPath || "https://res.cloudinary.com/photo-world-api/image/upload/v1653678061/tempFile.jpg"
                try {
                    const result = await cloudinary.v2.uploader.upload(tempPath);
                    imgUrl = result?.url;
                } catch (error) {
                    response.badRequest(error.messages)
                }
            }  

            place.nome = body.nome;
            place.desc = body.desc;
            place.local = body.local;
            place.img = imgUrl;

            await place.save();

            response.status(200);
            return {
                message: 'Lugar atualizado com sucesso!',
                data: place,
            }
        }

        response.status(404);
        return {
            message: 'Lugar não encontrado',
        }
    }

    public async destroy( { params, response } : HttpContextContract) {
        const id = params.id;
        const place = await Place.find(id);

        if (place) {
            await place.delete();

            response.status(200);
            return {
                message: 'Lugar removido com sucesso!'
            }
        }

        response.status(404);
        return {
            message: 'Lugar não encontrado',
        }
    }

}