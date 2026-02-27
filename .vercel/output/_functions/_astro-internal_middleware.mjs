import { d as defineMiddleware, s as sequence } from './chunks/index_DSYUNzRj.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CYKN9qS4.mjs';
import 'kleur/colors';
import './chunks/astro/server_D3ZOkX-6.mjs';
import 'clsx';
import 'cookie';

const onRequest$1 = defineMiddleware((_context, next) => {
  return next();
});

const onRequest = sequence(

	onRequest$1

);

export { onRequest };
