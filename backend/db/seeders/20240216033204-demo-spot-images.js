'use strict';

const { SpotImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await SpotImage.bulkCreate([

      { spotId: 1, url: 'https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/activities/xvj3ajrf7rgb882pr7hj.jpeg', preview: true,},
      { spotId: 1, url: 'https://media.architecturaldigest.com/photos/621e2b8a0dfcde70e6b201e0/1:1/w_1707,h_1707,c_limit/SB_2614-HDR-scaled.jpeg', preview: false },
      { spotId: 1, url: 'https://www.desertpalmshotel.com/resourcefiles/blogsmallimages/new-attractions-at-disneyland-2020-beyond.jpg', preview: false },
      { spotId: 1, url: 'https://drupal8-prod.visitcalifornia.com/sites/drupal8-prod.visitcalifornia.com/files/styles/fluid_1200/public/2021-04/VC-Disneyland-Reopen-Mickey-SUPPLIED-1280x640.jpg.webp?itok=26Felejl', preview: false },
      { spotId: 1, url: 'https://insidethemagic.net/wp-content/uploads/2022/10/Disneyland-vs-disney-world-wmickey-800x400.png', preview: false },

      { spotId: 2, url: 'https://cache.undercovertourist.com/blog/2024/01/0224-pixar-place-hotel-lobby-entrance.jpg', preview: true,},
      { spotId: 2, url: 'https://thepointsguy.global.ssl.fastly.net/us/originals/2024/02/Lobby-colors-1-copy.jpg', preview: false },
      { spotId: 2, url: 'https://www.micechat.com/wp-content/uploads/2023/07/Pixar-Place-Hotel-Pool-Area.jpg', preview: false },
      { spotId: 2, url: 'https://ktla.com/wp-content/uploads/sites/4/2023/05/20221004_Pixar-Place-Exterior.jpg?w=2202&h=1440&crop=1', preview: false },
      { spotId: 2, url: 'https://mma.prnewswire.com/media/2330424/Disneyland_Resort_Pixar_Place_Hotel_grand_opening.jpg?p=facebook', preview: false },

      { spotId: 3, url: 'https://images.thedirect.com/media/article_med/disney-marvel-studios.jpg', preview: true,},
      { spotId: 3, url: 'https://www.ocregister.com/wp-content/uploads/2023/08/OCR-L-DIS-STORE-0331-JG-02-1.jpg?w=1024', preview: false },
      { spotId: 3, url: 'https://imageio.forbes.com/specials-images/imageserve/60b8eb71fe994951ed9186da/Disney-Avengers-Campus/960x0.jpg?format=jpg&width=960', preview: false },
      { spotId: 3, url: 'https://d23.com/app/uploads/2020/03/1180w-600h_030920_avengers-campus.jpg', preview: false },
      { spotId: 3, url: 'https://i.ytimg.com/vi/QfTVikSS4-Q/maxresdefault.jpg', preview: false },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [8, 9, 10] }
    }, {});
  }
};
