import { visit } from 'unist-util-visit';

export function remarkDirectiveRehype() {
    return (tree) => {
        visit(tree, (node) => {
            if (
                node.type === 'textDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'containerDirective'
            ) {
                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};

                // Let's support converting `:::note` into `<div class="callout tip">` 
                // by reading the directive name.
                let className = attributes.class || '';
                if (node.name === 'note') className += ' callout info';
                if (node.name === 'tip') className += ' callout tip';
                if (node.name === 'warning') className += ' callout warning';

                if (node.type === 'textDirective') {
                    data.hName = 'span';
                    data.hProperties = { class: className.trim(), ...attributes };
                } else {
                    data.hName = 'div';
                    data.hProperties = { class: className.trim(), ...attributes };
                }
            }
        });
    };
}
