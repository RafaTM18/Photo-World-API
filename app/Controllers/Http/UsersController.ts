import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import cloudinary from 'cloudinary';
import Env from '@ioc:Adonis/Core/Env';

import User from 'App/Models/User';

const messages = {
    'required': 'O campo {{ field }} é obrigatório',
    'alpha': 'O campo {{ field }} precisa conter somente letras',
    'minLength': 'O campo {{ field }} precisa ter no mínimo {{ options.minLength }} caracteres',
    'maxLength': 'O campo {{ field }} precisa ter no máximo {{ options.maxLength }} caracteres',
    'unique': 'O campo {{ field }} precisa ser único, esse {{ field }} já foi utilizado',
    'date.format': 'O camp {{ field }} deve ser formatado como {{ options.format }}',
    'before': 'O campo {{ field }} precisa ser uma data anterior a atual',
}

cloudinary.v2.config({
    cloud_name: Env.get('CLOUD_NAME'),
    api_key: Env.get('API_KEY'),
    api_secret: Env.get('API_SECRET'),
})

export default class UsersController {
    private validationOpt = {
        types: ['image'],
        size: '2mb',
    }

    public async index() {
        let users = await User.all()
        return users.length == 0 ? 'Não foi adicionado nenhum usuário' : users.map((user) => user.serialize());
    }

    public async show({ params, response } : HttpContextContract) {
        const id = params.id;

        let user = await User.find(id);
        if (user) {
            response.status(200);
            return user.serialize();
        }

        response.status(404);
        return 'Usuário não encontrado';
    }

    public async store({ request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            nome: schema.string({trim: true}, [
                rules.required(),
                rules.alpha({
                    allow: ['space']
                }),
                rules.minLength(3),
                rules.maxLength(50),
            ]),
            username: schema.string({trim: true}, [
                rules.required(),
                rules.unique({ table: 'users', column: 'username'}),
                rules.minLength(3),
                rules.maxLength(25),
            ]),
            password: schema.string({trim: true}, [
                rules.required(),
            ]),
            dtNasc: schema.date({
                format: 'yyyy-MM-dd'
            },
            [
                rules.required(),
                rules.before('today')
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
        let user = await User.create(body);
        
        if (user) {
            user.foto = imgUrl;
            await user.save();

            response.status(201);
            return {
                message: 'Usuário cadastrado com sucesso!',
                data: user,
            }
        }
        
        response.status(500);
        return 'Houve um erro ao realizar o cadastro do usuário';
    }

    public async update({ params, request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            nome: schema.string({trim: true}, [
                rules.required(),
                rules.alpha({
                    allow: ['space']
                }),
                rules.minLength(3),
                rules.maxLength(50),
            ]),
            username: schema.string({trim: true}, [
                rules.required(),
                rules.unique({ table: 'users', column: 'username'}),
                rules.minLength(3),
                rules.maxLength(25),
            ]),
            dtNasc: schema.date({
                format: 'yyyy-MM-dd'
            },
            [
                rules.required(),
                rules.before('today')
            ])
        });
        const id = params.id;
        const body = await request.validate({schema: validationSchema, messages});
        const user = await User.find(id);   

        if (user) {
            const img = request.file('foto', this.validationOpt);
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
               

            user.nome = body.nome;
            user.username = body.username;
            user.foto = imgUrl;
            user.dtNasc = body.dtNasc;

            await user.save();

            response.status(200);
            return {
                message: 'Usuário atualizado com sucesso!',
                data: user,
            }
        }

        response.status(404);
        return {
            message: 'Usuário não encontrado',
        }
    }

    public async destroy( { params, response } : HttpContextContract) {
        const id = params.id;
        console.log(id)
        const user = await User.find(id);

        if (user) {
            await user.delete();

            response.status(200);
            return {
                message: 'Usuário removido com sucesso!'
            }
        }

        response.status(404);
        return {
            message: 'Usuário não encontrado',
        }
    }
}
