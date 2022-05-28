import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

import Community from 'App/Models/Community';

const messages = {
    'required': 'O campo {{ field }} é obrigatório',
    'alpha': 'O campo {{ field }} precisa conter somente letras',
    'minLength': 'O campo {{ field }} precisa ter no mínimo {{ options.minLength }} caracteres',
    'maxLength': 'O campo {{ field }} precisa ter no máximo {{ options.maxLength }} caracteres',
    'unique': 'O campo {{ field }} precisa ser único, esse {{ field }} já foi utilizado',
}

export default class CommunitiesController {
    public async index() {
        let communities = await Community.all()
        return communities.length == 0 ? 'Não foi adicionada nenhuma comunidade' : communities.map((community) => community.serialize());
    }

    public async show({ params, response } : HttpContextContract) {
        const id = params.id;

        let community = await Community.find(id);
        if (community) {
            response.status(200);
            return community.serialize();
        }

        response.status(404);
        return 'Comunidade não encontrada';
    }

    public async store({ request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            nome: schema.string({trim: true}, [
                rules.required(),
                rules.alpha({
                    allow: ['space']
                }),
                rules.unique({ table: 'communities', column: 'nome'}),
                rules.minLength(3),
                rules.maxLength(50),
            ]),
            desc: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(250),
            ]),
        });
        const body = await request.validate({schema: validationSchema, messages}); 
        const community = await Community.create(body);

        response.status(201);
        return {
            message: 'Comunidade cadastrada com sucesso!',
            data: community,
        }
    }

    public async update({ params, request, response } : HttpContextContract) {
        const validationSchema = schema.create({
            nome: schema.string({trim: true}, [
                rules.required(),
                rules.alpha({
                    allow: ['space']
                }),
                rules.unique({ table: 'communities', column: 'nome'}),
                rules.minLength(3),
                rules.maxLength(50),
            ]),
            desc: schema.string({trim: true}, [
                rules.required(),
                rules.minLength(3),
                rules.maxLength(250),
            ]),
        });
        const id = params.id;
        const body = await request.validate({schema: validationSchema, messages});
        const community = await Community.find(id);

        if (community) {
            community.nome = body.nome;
            community.desc = body.desc;

            await community.save();

            response.status(200);
            return {
                message: 'Comunidade atualizada com sucesso!',
                data: community,
            }
        }

        response.status(404);
        return {
            message: 'Comunidade não encontrada',
        }
    }

    public async destroy( { params, response } : HttpContextContract) {
        const id = params.id;
        const community = await Community.find(id);

        if (community) {
            await community.delete();

            response.status(200);
            return {
                message: 'Comunidade removida com sucesso!'
            }
        }

        response.status(404);
        return {
            message: 'Comunidade não encontrada',
        }
    }

}
