import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator';

import Comment from 'App/Models/Comment';

const messages = {
    'required': 'O campo {{ field }} é obrigatório',
    'exists': 'O campo {{ field }} precisa existir na tabela {{ options.table }}',
    'minLength': 'O campo {{ field }} precisa ter no mínimo {{ options.minLength }} caracteres',
    'maxLength': 'O campo {{ field }} precisa ter no máximo {{ options.maxLength }} caracteres',
}

export default class CommentsController {
    public async index() {
        let comments = await Comment.all()
        return comments.length == 0 ? 'Não foi adicionado nenhum comentário' : comments.map((comment) => comment.serialize());
    }

    public async show({ params, response } : HttpContextContract) {
        const id = params.id;

        let comment = await Comment.find(id);
        if (comment) {
            response.status(200);
            return comment.serialize();
        }

        response.status(404);
        return 'Usuário não encontrado';
    }

    public async store({ request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            id_autor: schema.number([
                rules.required(),
                rules.exists({ table: 'users', column: 'id' }),
            ]),
            id_post: schema.number([
                rules.required(),
                rules.exists({ table: 'posts', column: 'id' }),
            ]),
            text: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(500),
            ]),
        });
        const body = await request.validate({schema: validationSchema, messages}); 
        const comment = await Comment.create(body);

        response.status(201);
        return {
            message: 'Comentário cadastrado com sucesso!',
            data: comment,
        }
    }

    public async update({ params, request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            id_autor: schema.number([
                rules.required(),
                rules.exists({ table: 'users', column: 'id' }),
            ]),
            id_post: schema.number([
                rules.required(),
                rules.exists({ table: 'posts', column: 'id' }),
            ]),
            text: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(500),
            ]),
        });
        const id = params.id;
        const body = await request.validate({schema: validationSchema, messages}); 
        const comment = await Comment.find(id);

        if (comment) {
            comment.text = body.text;

            await comment.save();

            response.status(200);
            return {
                message: 'Comentário atualizado com sucesso!',
                data: comment,
            }
        }

        response.status(404);
        return {
            message: 'Comentário não encontrado',
        }
    }

    public async destroy( { params, response } : HttpContextContract) {
        const id = params.id;
        const comment = await Comment.find(id);

        if (comment) {
            await comment.delete();

            response.status(200);
            return {
                message: 'Comentário removido com sucesso!'
            }
        }

        response.status(404);
        return {
            message: 'Comentário não encontrado',
        }
    }

}
