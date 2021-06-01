
/**
 * 通过 # 和 @ 来定义方块样式
 * # 表示方块， @ 表示方块的旋转点
 */
const shapes = [{
        shape: `
##@##`,
        color: '#F44336'
    },
    {
        shape: `
#@##`,
        color: '#673AB7'
    },
    {
        shape: `
#@#
 #`,
        color: '#2196F3'
    },
    {
        shape: `
#@#
#`,
        color: '#009688'
    },
    {
        shape: `
#@#
#`,
        color: '#009688'
    },
    {
        shape: `
#@#
`,
        color: '#795548'
    },
    {
        shape: `
#@
 ##`,
        color: '#FF9800'
    },
    {
        shape: `
 ##
#@`,
        color: '#FF9800'
    },
    {
        shape: `
 #
#@`,
        color: '#607D8B'
    },
    {
        shape: `
##
##`,
        color: '#3F51B5'
    },
];

export default shapes;

export const randomShape = () => {
    return shapes[~~(Math.random() * shapes.length)];
//       return  {
//         shape: `
// #####
// ##########
// ##########`,
//         color: '#3F51B5'
//     }
}