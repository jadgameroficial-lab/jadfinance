import Image from "next/image";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="jf-footer">
      <div className="container">
        <div className="jf-foot-grid">
          <div className="jf-foot-brand">
            <div className="jf-logo">
              <div className="jf-logo-mark"><Image src="/logo.png" alt="JAD Finance" width={28} height={28} /></div>
              <span className="jf-logo-word">JAD Finance</span>
            </div>
            <p>Controle financeiro premium para quem leva o próprio dinheiro a sério.</p>
          </div>
          <div className="jf-foot-col">
            <h5>Produto</h5>
            <a href="#showcase">Dashboard</a>
            <a href="#features">Recursos</a>
            <a href="#pricing">Planos</a>
          </div>
          <div className="jf-foot-col">
            <h5>Empresa</h5>
            <a href="#">Sobre</a>
            <a href="#">Carreiras</a>
            <a href="#">Blog</a>
          </div>
          <div className="jf-foot-col">
            <h5>Suporte</h5>
            <a href="#">Central de ajuda</a>
            <a href="#">Contato</a>
            <a href="#">Status</a>
          </div>
          <div className="jf-foot-col">
            <h5>Legal</h5>
            <a href="#">Privacidade</a>
            <a href="#">Termos de uso</a>
          </div>
        </div>

        <div className="jf-foot-bottom">
          <span>© 2026 JAD Finance. Todos os direitos reservados.</span>
          <div className="jf-foot-social">
            <a href="#" aria-label="Instagram"><FaInstagram size={15} /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin size={15} /></a>
            <a href="#" aria-label="GitHub"><FaGithub size={15} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
