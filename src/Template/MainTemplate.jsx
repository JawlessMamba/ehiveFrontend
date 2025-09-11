import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

function MainTemplate({ children}) {

    return (
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    )
}

export default MainTemplate