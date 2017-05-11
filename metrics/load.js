/**
 * Created by pablo on 5/5/17.
 */
module.exports = () => {
    require('./m_registerd-users').init();
    require('./m_send-requests').init();
    console.log("Metrics loaded!")
};