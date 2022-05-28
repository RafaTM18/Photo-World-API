import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import cloudinary from 'cloudinary';
import Env from '@ioc:Adonis/Core/Env';

import Post from 'App/Models/Post';

const messages = {
    'required': 'O campo {{ field }} é obrigatório',
    'url': 'O campo {{ field }} precisar ser uma URL válida',
    'exists': 'O campo {{ field }} precisa existir na tabela {{ options.table }}',
    'unsigned': 'O campo {{ field }} precisa ser positivo',
    'minLength': 'O campo {{ field }} precisa ter no mínimo {{ options.minLength }} caracteres',
    'maxLength': 'O campo {{ field }} precisa ter no máximo {{ options.maxLength }} caracteres',
}

cloudinary.v2.config({
    cloud_name: Env.get('CLOUD_NAME'),
    api_key: Env.get('API_KEY'),
    api_secret: Env.get('API_SECRET'),
})
export default class PostsController {
    private validationOpt = {
        types: ['image'],
        size: '2mb',
    }

    public async index() {
        let posts = await Post.all()
        return posts.length == 0 ? 'Não foi adicionado nenhum publicação' : posts.map((post) => post.serialize());
    }

    public async show({ params, response } : HttpContextContract) {
        const id = params.id;

        let post = await Post.find(id);
        if (post) {
            response.status(200);
            return post.serialize();
        }

        response.status(404);
        return 'Publicação não encontrada';
    }

    public async store({ request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            id_autor: schema.number([
                rules.required(),
                rules.exists({ table: 'users', column: 'id' }),
            ]),
            // id_place: schema.number([
            //     rules.required(),
            //     rules.exists({ table: 'places', column: 'id' }),
            // ]),
            desc: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(250),
            ]),
            local: schema.string({trim: true}, [
                rules.required(),
                rules.url()
            ]),
            likes: schema.number([
                rules.unsigned(),
            ])
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
        const post = await Post.create(body);

        if (post) {
            post.img = imgUrl;
            await post.save();

            response.status(201);
            return {
                message: 'Publicação cadastrada com sucesso!',
                data: post,
            }
        }
        
        response.status(500);
        return 'Houve um erro ao realizar o cadastro da publicação';
    }

    public async update({ params, request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            id_autor: schema.number([
                rules.required(),
                rules.exists({ table: 'users', column: 'id' }),
            ]),
            id_place: schema.number([
                rules.required(),
                rules.exists({ table: 'places', column: 'id' }),
            ]),
            desc: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(250),
            ]),
            likes: schema.number([
                rules.unsigned(),
            ])
        });
        const id = params.id;
        const body = await request.validate({schema: validationSchema, messages});
        const post = await Post.find(id);

        if (post) {
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

            post.desc = body.desc;
            post.img = imgUrl;
            post.likes = body.likes;

            await post.save();

            response.status(200);
            return {
                message: 'Publicação atualizado com sucesso!',
                data: post,
            }
        }

        response.status(404);
        return {
            message: 'Publicação não encontrado',
        }
    }

    public async destroy( { params, response } : HttpContextContract) {
        const id = params.id;
        const post = await Post.find(id);

        if (post) {
            await post.delete();

            response.status(200);
            return {
                message: 'Publicação removido com sucesso!'
            }
        }

        response.status(404);
        return {
            message: 'Publicação não encontrado',
        }
    }

}